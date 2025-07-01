from flask import Flask, render_template, request, jsonify, url_for
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy

# Inisialisasi Flask dan SocketIO
app = Flask(__name__, static_folder = 'static')
socketio = SocketIO(app, cors_allowed_origins="*")  # Mengizinkan semua origin

# Konfigurasi database URL untuk MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game_db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Menonaktifkan fitur pengawasan perubahan objek

# Inisialisasi SQLAlchemy
db = SQLAlchemy(app)

# Definisikan model untuk leaderboard
class Leaderboard(db.Model):
    __tablename__ = 'leaderboard'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    score = db.Column(db.Integer, nullable=False)

    def __init__(self, username, score):
        self.username = username
        self.score = score

    def __repr__(self):
        return f'<Leaderboard {self.username}, {self.score}>'

# Fungsi untuk menyimpan skor ke database
def save_score_to_database(username, score):
    """
    Menyimpan skor dan username ke dalam leaderboard.
    """
    try:
        # Log data yang diterima
        print(f"Saving score: username={username}, score={score}")  # Log input

        # Cek apakah username sudah ada di database
        existing_entry = Leaderboard.query.filter_by(username=username).first()

        if existing_entry:
            # Jika sudah ada, perbarui skor
            existing_entry.score = score
            print(f"Updated score for {username}: {score}")  # Log pembaruan
        else:
            # Jika tidak ada, buat entri baru
            new_entry = Leaderboard(username=username, score=score)
            db.session.add(new_entry)
            print(f"New entry added: {username} with score {score}")  # Log entri baru

        # Commit perubahan ke database
        db.session.commit()
        print(f"Score for {username} saved successfully: {score}")  # Log sukses

    except Exception as e:
        db.session.rollback()  # Rollback jika terjadi error
        print(f"Error saving score for {username}: {e}")  # Log error

# Fungsi untuk menyimpan leaderboard ke database
def save_to_leaderboard(leaderboard_data):
    """
    Menyimpan leaderboard data (hanya 10 pemain teratas) ke dalam database.
    """
    # Urutkan leaderboard berdasarkan score (dari yang terbesar)
    leaderboard_data = sorted(leaderboard_data, key=lambda x: x['score'], reverse=True)
    
    # Ambil 10 pemain teratas
    leaderboard_data = leaderboard_data[:10]
    
    # Hapus semua data leaderboard lama
    Leaderboard.query.delete()

    # Sisipkan data leaderboard yang baru
    for entry in leaderboard_data:
        leaderboard_entry = Leaderboard(username=entry['username'], score=entry['score'])
        db.session.add(leaderboard_entry)

    # Commit transaksi ke database
    try:
        db.session.commit()
        print("Leaderboard successfully updated.")  # Debugging message
    except Exception as e:
        db.session.rollback()  # Rollback jika terjadi error
        print(f"Error updating leaderboard: {e}")


# Fungsi untuk mengambil leaderboard dari database
def get_leaderboard():
    """
    Mengambil leaderboard (hanya 10 pemain teratas) dari database.
    """
    try:
        leaderboard = Leaderboard.query.order_by(Leaderboard.score.desc()).limit(10).all()
        print(f"Leaderboard fetched successfully, {len(leaderboard)} entries retrieved.")
        
        # Ubah hasil query menjadi list of dicts
        leaderboard_data = [{'username': entry.username, 'score': entry.score} for entry in leaderboard]
        return leaderboard_data
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return []


# Route untuk halaman utama
@app.route('/')
def index():
    """
    Menampilkan halaman utama dengan tombol Start dan leaderboard.
    """
    return render_template('index.html')


# Route untuk memulai game
@app.route('/start_game', methods=['POST'])
def start_game():
    """
    Memproses data username yang dikirimkan dari halaman utama dan memulai game.
    """
    try:
        data = request.get_json()
    except Exception as e:
        return jsonify({'success': False, 'message': f"Invalid JSON format: {str(e)}"}), 400

    username = data.get('username')

    if not username:
        return jsonify({'success': False, 'message': 'Username is required!'}), 400

    # Simpan username ke sesi atau log untuk tujuan tertentu
    print(f"Game started for username: {username}")

    return jsonify({'success': True, 'message': f"Welcome, {username}!"})


# Route untuk halaman game
@app.route('/game', methods=['POST', 'GET'])
def game():
    if request.method == 'POST':
        try:
            data = request.get_json()  # Mencoba mengambil data JSON
            username = data.get('username')
            score = data.get('score')

            # Log untuk debugging
            print(f"Received data: username={username}, score={score}")  # Cek data yang diterima

            # Simpan skor ke database
            if username and score is not None:
                save_score_to_database(username, score)  # Simpan skor ke database

                return jsonify({'success': True, 'message': 'Score saved successfully!'})

            return jsonify({'success': False, 'message': 'Invalid data'})

        except Exception as e:
            print(f"Error processing data: {e}")
            return jsonify({'success': False, 'message': 'Error processing data'}), 500

    return render_template('game.html')


# Route untuk menampilkan leaderboard
@app.route('/leaderboard', methods=['GET'])
def get_leaderboard_route():
    """
    Mengambil leaderboard dari database dan menampilkannya.
    """
    leaderboard_data = get_leaderboard()  # Ambil data leaderboard dari database

    # Menggunakan render_template untuk mengirimkan data leaderboard ke template HTML
    return render_template('leaderboard.html', leaderboard=leaderboard_data)


# Route untuk menyimpan leaderboard setelah game selesai
@app.route('/save_score', methods=['POST'])
def save_score():
    """
    Menyimpan skor dan username ke dalam leaderboard setelah game selesai.
    """
    data = request.get_json()
    username = data.get('username')
    score = data.get('score')

    # Debug log untuk cek apakah data valid
    print(f"Received save_score data: username={username}, score={score}")

    if username and score:
        # Simpan skor ke database
        save_score_to_database(username, score)

        return jsonify({'success': True, 'message': 'Score saved successfully!'})
    
    return jsonify({'success': False, 'message': 'Username or score is missing'})


# Route untuk menyimpan leaderboard secara keseluruhan
@app.route('/gameover', methods=['POST'])
def gameover():
    """
    Menyimpan skor dan username ke dalam leaderboard setelah game selesai.
    """
    try:
        # Ambil data username dan score dari JSON body
        data = request.get_json()
        username = data.get('username')
        score = data.get('score')

        if not username or score is None:
            return jsonify({'success': False, 'message': 'Username or score missing'}), 400
        
        # Simpan skor ke dalam database
        save_score_to_database(username, score)

        # Setelah data berhasil disimpan, redirect ke leaderboard
        return jsonify({'success': True, 'message': 'Score saved successfully', 'redirect': '/leaderboard'})
    
    except Exception as e:
        print(f"Error in /gameover route: {e}")
        return jsonify({'success': False, 'message': 'Error saving score'}), 500


# Jalankan aplikasi
if __name__ == '__main__':
    socketio.run(app, debug=True)
