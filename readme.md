# WifiWhisperer-See

Vision-only version of WifiWhisperer for IDFA DocLab 2016.

## Installation

First install Node.js and npm. To [install Node.js 7.x and npm on Ubuntu 16.04](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions):

```
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

Then install pod and configure it:

```
$ sudo npm install -g pod
$ pod
$ pod remote wifiwhisperer https://github.com/kylemcdonald/wifiwhisperer-see.git
```

Start the pod web service with `pod web`. Then add your server to the GitHub hooks following the instructions [here](https://github.com/yyx990803/pod/wiki/Using-a-remote-repo).

If you're developing on the server, you want to set up ssh access to GitHub.

```
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
$ cat ~/.ssh/id_rsa.pub
```

And add the ssh key to your GitHub account.