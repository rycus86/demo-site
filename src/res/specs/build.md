To have my dev laptop nicely organised and my tools kept portable in case I want to
switch to another `OS` or machine I tend to avoid installing anything on it 
apart from `Docker` and `Git` (though `Git` comes pre-installed I think on `Debian`).

To write `Python` code and related configurations (like `Dockerfile`s, `Bash` scripts, etc.)
I use the excellent [PyCharm CE](https://www.jetbrains.com/pycharm) from JetBrains - 
in a `Docker` container of course.  
Check out the [rycus86/docker-pycharm](https://github.com/rycus86/docker-pycharm) 
repository to see how to use it on (probably) anything with `X11` on it.  
More details on how to run `GUI` applications with `Docker` check out 
[this link](https://blog.jessfraz.com/post/docker-containers-on-the-desktop/).

If you don't have or want `PyCharm` installed on your host machine then
have a look at `vim` which is a great editor with syntax coloring and 
tons of other useful features.