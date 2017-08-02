from flask import Flask, request, render_template, send_from_directory
from flask_cache import Cache

from utils import *

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 30 * 24 * 60 * 60  # 1 month

cache = Cache(app, config={'CACHE_TYPE': 'simple'})


@app.route('/')
def main():
    resources = load_resources()
    first_tab = resources.get('tabs')[0].get('key')
    return page(first_tab)


@app.route('/page/<key>')
@cache.memoize(timeout=7 * 24 * 60 * 60)  # 1 week
def page(key):
    resources = load_resources()
    if key not in (tab.get('key') for tab in resources.get('tabs')):
        return page_not_found('Missing tab: %s' % key)

    return render_template('layout.html',
                           selected_tab=key,
                           markdown=pretty_markdown,
                           assets=load_static_asset_mappings(),
                           read=read_resource_file,
                           **resources)


@app.route('/render/<template>', methods=['POST'])
def render(template):
    return render_template('render/%s.html' % template, data=request.json, markdown=pretty_markdown)


@app.route('/markdown', methods=['POST'])
def render_markdown():
    return pretty_markdown(request.data.decode('utf-8'))


@app.route('/favicon.ico')
def favicon():
    return send_from_directory('assets', 'favicon.ico')


@app.route('/asset/<hash>/<path:asset_file>')
def asset(hash, asset_file):
    return send_from_directory('assets', asset_file)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


if __name__ == '__main__':  # pragma: no cover
    app.run(host=os.environ.get('HTTP_HOST', '127.0.0.1'),
            port=int(os.environ.get('HTTP_PORT', '5000')),
            debug=False)
