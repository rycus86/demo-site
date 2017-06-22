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
                self.assertIn('<a class="mdl-layout__tab" href="#%s">%s</a>' % (tab['key'], tab['title']), content)

            else:
                self.assertIn('<a class="mdl-layout__tab is-active" href="#%s">%s</a>' % (tab['key'], tab['title']),
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

    def test_css_js_includes(self):
        content = self.get_html('/')

        self.assertMatches('.*<link rel="stylesheet" href="/asset/[0-9a-f]{10}/styles.css">', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/app.js">', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/datetime.js">', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/github.js">', content)
        self.assertMatches('.*<script src="/asset/[0-9a-f]{10}/dockerhub.js">', content)
    
    def test_tracking(self):
        content = self.get_html('/')

        self.assertIn('<!-- Cedexis for cdn.jsdelivr.net -->', content)
        self.assertIn('<!-- Google Analytics -->', content)

    def test_home_panel(self):
        content = self.get_html('/')

        self.assertIn('<h2 class="mdl-card__title-text">Welcome</h2>', content)
        self.assertIn('This website exists to showcase an example', content)

        self.assertIn('<h2 class="mdl-card__title-text">Components</h2>', content)
        self.assertIn('This site is made up of the following components', content)

        self.assertIn('<h2 class="mdl-card__title-text">Acknowledgements</h2>', content)
        self.assertIn('<code>Python</code> web framework', content)

    def test_error_page(self):
        response = self.client.get('/page/not/found')

        self.assertEqual(response.status_code, 404)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        content = response.data

        self.assertIn('<title>Page not found</title>', content)
        self.assertIn('<h2>Oops... This page is not found.</h2>', content)

        # make sure there's tracking on the error page
        self.assertIn('<!-- Cedexis for cdn.jsdelivr.net -->', content)
        self.assertIn('<!-- Google Analytics -->', content)

