import os
import hashlib
from flask import Flask, request, render_template, json, send_from_directory
from markdown import markdown

app = Flask(__name__)


@app.route('/')
def main():
    return render_template('layout.html',
                           markdown=markdown,
                           assets=load_static_asset_mappings(),
                           read=_read_resource_file,
                           **load_resources())


def load_resources():
    results = dict()

    for res in os.listdir(_relative_path('res')):
        if not res.endswith('.json'):
            continue

        key = res.replace('.json', '')

        with open(_relative_path('res/%s' % res)) as input_resource:
            data = json.load(input_resource)
            results[key] = data

    return results


def load_static_asset_mappings():
    results = dict()

    for dir_path, dir_names, file_names in os.walk(_relative_path('assets')):
        for name in file_names:
            path = '%s/%s' % (dir_path, name)

            md5 = hashlib.md5()
            with open(_relative_path(path), 'r') as static_file:
                md5.update(static_file.read())
            hashed = md5.hexdigest()

            key = path.replace('%s/' % _relative_path('assets'), '')
            value = '/asset/%s/%s' % (hashed[:10], key)
            results[key] = value

    return results


def _read_resource_file(name):
    with open(_relative_path('res/%s' % name)) as input_file:
        return input_file.read()


def _relative_path(path):
    return os.path.join(os.path.dirname(__file__), path)


@app.route('/render/<template>', methods=['POST'])
def render(template):
    return render_template('render/%s.html' % template, data=request.json, markdown=markdown)


@app.route('/asset/<hash>/<path:asset_file>')
def asset(hash, asset_file):
    return send_from_directory('assets', asset_file)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


def run_server():
    app.run(host='0.0.0.0', debug=False)


if __name__ == '__main__':
    run_server()
