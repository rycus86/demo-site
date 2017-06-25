from flask import Flask, request, render_template, send_from_directory
from flask_cache import Cache
from utils import *

app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})


@app.route('/')
def main():
    return render_template('layout.html',
                           markdown=pretty_markdown,
                           assets=load_static_asset_mappings(),
                           read=read_resource_file,
                           **load_resources())


@app.route('/render/<template>', methods=['POST'])
def render(template):
    return render_template('render/%s.html' % template, data=request.json, markdown=pretty_markdown)


@app.route('/asset/<hash>/<path:asset_file>')
def asset(hash, asset_file):
    return send_from_directory('assets', asset_file)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


if __name__ == '__main__':  # pragma: no cover
    app.run(host='0.0.0.0', debug=False)
