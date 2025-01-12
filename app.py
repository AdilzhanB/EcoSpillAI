from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory
import os
from werkzeug.utils import secure_filename
import EcoSpillai.spill_vector as spill_vector
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['PREDICTIONS_FOLDER'] = 'static/predictions'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def home():
    return render_template('index.html')
@app.route('/index.html')
def index_html():
    return redirect(url_for('home'))

@app.route('/about')
def about():
    return render_template('about.html')
@app.route('/about.html')
def about_html():
    return redirect(url_for('about'))

@app.route('/problem')
def problem():
    return render_template('problem.html')
@app.route('/problem.html')
def problem_html():
    return redirect(url_for('problem'))

@app.route('/solutions')
def solutions():
    return render_template('solutions.html')
@app.route('/solutions.html')
def solutions_html():
    return redirect(url_for('solutions'))

@app.route('/gemini')
def gemini():
    return render_template('gemini.html')
@app.route('/gemini.html')
def gemini_html():
    return redirect(url_for('gemini'))

@app.route('/formpage')
def formpage():
    return render_template('formpage.html')
@app.route('/formpage.html')
def formpage_html():
    return redirect(url_for('formpage'))

@app.route('/visual')
def visual():
    image_path = request.args.get('image_path')
    if image_path is None:
        return "Image path is missing", 400
    return render_template('visual.html', image_path=image_path)
@app.route('/visual.html')
def visual_html():
    return redirect(url_for('visual'))

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    file = request.files['image']
    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return render_template('formpage.html', uploaded_image=filename)
                               
@app.route('/process_image', methods=['POST'])
def process_image():
    filename = request.form['filename']
    if not os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
        return "File not found", 404
    processed_image = spill_vector.predict_spread(filename)
    unique_filename = f"{uuid.uuid4().hex[:8]}.jpeg"
    processed_image_path = os.path.join(app.config['PREDICTIONS_FOLDER'], unique_filename)
    with open(processed_image_path, 'wb') as f:
        f.write(processed_image.getvalue())
    return render_template('visual.html', image_path=processed_image_path)

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)