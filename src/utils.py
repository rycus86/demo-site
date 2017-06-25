import os
import re
import json
import hashlib
from markdown import markdown
from flask import g


def pretty_markdown(text, *args, **kwargs):
    return markdown(_replace_image_placeholders(text),
                    *args, extensions=['markdown.extensions.fenced_code'], **kwargs)


def _replace_image_placeholders(text):
    mappings = load_static_asset_mappings()

    # placeholders look like: {{ image: filename.ext }}
    for match in re.finditer(r'{{\s*image:\s*([^}]+?)\s*}}', text):
        filename = match.group(1)
        mapped = mappings['images/%s' % filename]

        text = text.replace(match.group(0), mapped)

    return text


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
    if hasattr(g, 'asset_mappings'):
        return g.asset_mappings

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

    g.asset_mappings = results

    return results


def read_resource_file(name):
    with open(_relative_path('res/%s' % name)) as input_file:
        return input_file.read()


def _relative_path(path):
    return os.path.join(os.path.dirname(__file__), path)
