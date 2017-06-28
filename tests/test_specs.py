import unittest

import app


class SpecificationsTest(unittest.TestCase):
    def setUp(self):
        app.app.testing = True
        self.client = app.app.test_client()

    def get_html(self, uri):
        response = self.client.get(uri)

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        return response.data
    
    def test_sections(self):
        content = self.get_html('/')

        self.assertIn('<h2 class="mdl-card__title-text">Overview</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Build</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Continuous Integration</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Continuous Deployment</h2>', content)

    def test_overview(self):
        content = self.get_html('/')

        self.assertIn('<p>We can see on the high-level overview', content)

    def test_build(self):
        content = self.get_html('/')

        self.assertIn('<p>To write <em>Python</em> code', content)
        self.assertIn('>rycus86/docker-pycharm</a>', content)

    def test_ci(self):
        content = self.get_html('/')

        self.assertIn('<h2>Prepare</h2>', content)
        self.assertIn('<h2>Testing</h2>', content)
        self.assertIn('<h2>Measuring quality</h2>', content)
        self.assertIn('<h2>Visualising quality</h2>', content)
        self.assertIn('<h3>Coveralls</h3>', content)
        self.assertIn('<h3>Code Climate</h3>', content)
        self.assertIn('<h2>Travis CI</h2>', content)

    def test_cd(self):
        content = self.get_html('/')

        self.assertIn('<h2>Docker</h2>', content)
        self.assertIn('<h2>Docker Hub</h2>', content)
        self.assertIn('<h2>Multiarch builds</h2>', content)
        self.assertIn('<h2>Hosting</h2>', content)
        self.assertIn('<h3>docker-compose</h3>', content)
        self.assertIn('<h3>Proxy server</h3>', content)
        self.assertIn('<h3>Dynamic DNS</h3>', content)
        self.assertIn('<h2>Updates</h2>', content)
