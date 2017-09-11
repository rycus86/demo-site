import hashlib
import json
import os
import re

from flask import g
from markdown import markdown, Extension
from markdown.preprocessors import Preprocessor
from markdown.treeprocessors import Treeprocessor


class _ImagePlaceholderPreprocessor(Preprocessor):
    pattern = re.compile(r'{{\s*image:\s*([^}]+?)\s*}}')

    def run(self, lines):
        mappings = load_static_asset_mappings()
        changed = list()

        for line in lines:
            for match in self.pattern.finditer(line):
                filename = match.group(1)
                mapped = mappings['images/%s' % filename]

                line = line.replace(match.group(0), mapped)

            changed.append(line)

        return changed


class _LazyLoadingImageProcessor(Treeprocessor):
    def run(self, root):
        for img in root.iter('img'):
            img.attrib['data-src'] = img.attrib['src']
            del img.attrib['src']


class _MarkdownExtension(Extension):
    def extendMarkdown(self, md, md_globals):
        md.preprocessors['img-proc'] = _ImagePlaceholderPreprocessor()
        md.treeprocessors.add('img-lazy', _LazyLoadingImageProcessor(), '_end')


def process_markdown(text, *args, **kwargs):
    return markdown(text, *args, extensions=['fenced_code', 'tables', _MarkdownExtension()], **kwargs)


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
