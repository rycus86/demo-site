Testing starts even before the code is submitted to remote services with a `git commit`.
I use a simple [git pre-commit hook](https://github.com/rycus86/demo-site/blob/master/.pre-commit.sh)
to check that I don't commit something I know won't build successfully or
would contain *debug* settings only meaningful for local development.

Setting it up is quite easy. Have an executable file (like *Shell* script) 
in your project root (__*.pre-commit.sh*__ for example) then run:  
`ln -s ../../.pre-commit-sh .git/hooks/pre-commit`  
You'll have to do this once - though on each machine you clone the *git* project to.
You can (and should) check in your *git hook scripts* into version control but
unfortunately you cannot automatically register them with *git* locally.

This gives you a nice *fail-fast* way of doing some sanity-checks on your codebase
but you'll probably want to repeat most of the steps in a *CI* service too - in case
a change is submitted without having the *git* hooks in place or with `git commit --no-verify`.
