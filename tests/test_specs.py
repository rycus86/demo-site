import re
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

    def test_overview(self):
        content = self.get_html('/')

        self.assertIn('<p>We can see on the high-level overview', content)

    def test_build(self):
        content = self.get_html('/')

        self.assertIn('<p>To write <em>Python</em> code', content)
        self.assertIn('>rycus86/docker-pycharm</a>', content)

    def test_ci(self):
        content = self.get_html('/')

        self.assertIn('<h2 class="mdl-card__title-text">Prepare</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Testing</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Measuring quality</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Coveralls</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Code Climate</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Travis CI</h2>', content)

    def test_cd(self):
        content = self.get_html('/')

        self.assertIn('<h2 class="mdl-card__title-text">Docker</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Docker Hub</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Multiarch builds</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Hosting</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">docker-compose</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Proxy server</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Dynamic DNS</h2>', content)
        self.assertIn('<h2 class="mdl-card__title-text">Updates</h2>', content)

    def test_images(self):
        content = self.get_html('/')

        self.assertTrue(re.match('(?sm).*<img src="/asset/[^/]+/images/overview.svg', content),
                        msg='Image not found: overview.svg')
        self.assertTrue(re.match('(?sm).*style="background: url\\(/asset/[^/]+/images/pycharm.png\\) center / cover', content),
                        msg='Image not found: pycharm.png')

    def test_next_section_links(self):
        content = self.get_html('/')
        resources = app.load_resources()
        
        for index, card in enumerate(resources['specs_cards']):
            if index > 0:
                self.assertIn('<a href="#specs-card-%s"' % card['key'], content)

            else:
                self.assertNotIn('<a href="#specs-card-%s"' % card['key'], content)

