# coding=utf-8
import re
import unittest

import app


class AppTest(unittest.TestCase):
    def setUp(self):
        app.app.testing = True
        self.client = app.app.test_client()

    def assertMatches(self, pattern, text):
        self.assertIsNotNone(re.match(pattern, text, re.MULTILINE | re.IGNORECASE | re.DOTALL),
                             msg='The pattern %s is not found in %s' % (pattern, repr(text)))

    def get_html(self, uri):
        response = self.client.get(uri)

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        return response.data

    def test_layout(self):
        content = self.get_html('/')

        self.assertIn('</header>', content, msg='')
        self.assertIn('</main>', content, msg='')
        self.assertIn('</footer>', content, msg='')
        self.assertIn('</head>', content, msg='')
        self.assertIn('</body>', content, msg='')
        self.assertIn('</html>', content, msg='')

    def test_sections(self):
        content = self.get_html('/')
        resources = app.load_resources()

        for index, tab in enumerate(resources['tabs']):
            if index > 0:
                self.assertIn('<section class="mdl-layout__tab-panel" id="%s">' % tab['key'], content)

            else:
                self.assertIn('<section class="mdl-layout__tab-panel is-active" id="%s">' % tab['key'], content)

            self.assertIn('<div class="mdl-grid" id="panel-%s">' % tab['key'], content)

    def test_navigation_tabs(self):
        content = self.get_html('/')
        resources = app.load_resources()

        for index, tab in enumerate(resources['tabs']):
            if index > 0:
                self.assertMatches('.*<a id="tab-%s" href="/page/%s"\\s+'
                                   'class="mdl-layout__tab">%s</a>' % (tab['key'], tab['key'], tab['title']), content)

            else:
                self.assertMatches('.*<a id="tab-%s" href="/page/%s"\\s+'
                                   'class="mdl-layout__tab is-active">%s</a>' % (tab['key'], tab['key'], tab['title']),
                                   content)

    def test_navigation_panels(self):
        content = self.get_html('/')
        resources = app.load_resources()

        for index, tab in enumerate(resources['tabs']):
            if index > 0:
                self.assertIn('<section class="mdl-layout__tab-panel" id="%s">' % tab['key'], content)

            else:
                self.assertIn('<section class="mdl-layout__tab-panel is-active" id="%s">' % tab['key'], content)

            self.assertIn('<div class="mdl-grid" id="panel-%s">' % tab['key'], content)

    def test_page(self):
        content = self.get_html('/page/github')
        resources = app.load_resources()

        for index, tab in enumerate(resources['tabs']):
            if tab['key'] == 'github':
                self.assertMatches('.*<a id="tab-%s" href="/page/%s"\\s+'
                                   'class="mdl-layout__tab is-active">%s</a>' % (tab['key'], tab['key'], tab['title']),
                                   content)
                self.assertIn('<section class="mdl-layout__tab-panel is-active" id="%s">' % tab['key'], content)

            else:
                self.assertMatches('.*<a id="tab-%s" href="/page/%s"\\s+'
                                   'class="mdl-layout__tab">%s</a>' % (tab['key'], tab['key'], tab['title']), content)
                self.assertIn('<section class="mdl-layout__tab-panel" id="%s">' % tab['key'], content)

            self.assertIn('<div class="mdl-grid" id="panel-%s">' % tab['key'], content)

    def test_missing_page(self):
        response = self.client.get('/page/missing-page')

        self.assertEqual(response.status_code, 404)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        content = response.data

        self.assertIn('<title>Page not found</title>', content)

    def test_css_js_includes(self):
        content = self.get_html('/')

        self.assertMatches('.*<link rel="stylesheet" href="/asset/[0-9a-f]{10}/styles.css" type="text/css"/>', content)
        self.assertMatches('.*<link rel="stylesheet" href="/asset/[0-9a-f]{10}/ext/material/material.min.css" type="text/css"/>', content)

        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/ext/material/material.min.js" defer>', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/app.js" defer>', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/datetime.js" defer>', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/github.js" defer>', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/dockerhub.js" defer>', content)

    def test_tracking(self):
        content = self.get_html('/')

        self.assertIn('<!-- Google Analytics -->', content)

    def test_home_panel(self):
        content = self.get_html('/')

        self.assertIn('<h2 class="mdl-card__title-text">Welcome</h2>', content)
        self.assertIn('This website exists to showcase an example', content)

        self.assertIn('<h2 class="mdl-card__title-text">Components</h2>', content)
        self.assertIn('This site is made up of the following components', content)

        self.assertIn('<h2 class="mdl-card__title-text">Acknowledgements</h2>', content)
        self.assertIn('<em>Python</em> web framework', content)

    def test_error_page(self):
        response = self.client.get('/page/not/found')

        self.assertEqual(response.status_code, 404)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        content = response.data

        self.assertIn('<title>Page not found</title>', content)
        self.assertIn('<h2>Oops... This page is not found.</h2>', content)

        # make sure there's tracking on the error page
        self.assertIn('<!-- Google Analytics -->', content)

    def test_markdown(self):
        request_data = u"""# Testing unicode 
        *From the TweetWear project*:
        
        - [Евгений Дрямин](https://github.com/bluegekkon) for Russian translation"""

        response = self.client.post('/markdown', data=u'\n'.join(map(unicode.strip, request_data.splitlines())))

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        content = response.data

        self.assertIn('<h1>Testing unicode</h1>', content)
        self.assertIn('<em>From the TweetWear project</em>:', content)
        self.assertIn(u'Евгений Дрямин', content.decode('utf-8'))
