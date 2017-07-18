Testing is important to verify that adding new features to your application will work
as expected but also to make sure that those new features won't break any other existing ones.

For *Python* projects one of the easiest ways to have unit tests is with the official, pre-installed
[unittest](https://docs.python.org/2/library/unittest.html) module.

Running all your tests is easy:  
`PYTHONPATH=src python -m unittest discover -s tests -v`  
This assumes you're running the command from your project's root directory where the
actual sources are in the `src` folder and the tests in the `tests` folder.
