# Deploying Quizzard (LXC container + Tailscale)

Quizzard is static files. The container only needs a basic web server, and Tailscale makes it
reachable from the learner's phone without exposing anything to the internet.

> Minimal Debian container images often do not include `sudo`. If a `sudo` command is not found, log in as `root` and run it without `sudo`, or install it with `apt-get install sudo`. The copy step needs a normal user that can log in over SSH, so create one with `adduser <name>` if you only have `root`.

```
phone (Tailscale) ──tailnet──▶ tailscale serve (HTTPS) ──▶ nginx on 127.0.0.1:8080 ──▶ /var/www/quizzard
```

> **Status:** these steps were written without access to your mini PC, so they have **not been run**.
> They assume a **Debian 12** container; for another distribution, change the package commands.
> Where a command or flag differs by version, the tool's own `--help` is the source of truth.

## 1. Create the container
Create a Debian 12 LXC container (for example `quizzard`) with a small disk (1 GB is plenty), and
give it normal outbound network access. It does **not** need a port forwarded from your router, now
or later.

### Let the container use a Tailscale network device
Tailscale needs `/dev/net/tun` inside the container. Do this on the host, then restart the container.

- **Proxmox:** add these two lines to `/etc/pve/lxc/<CTID>.conf`:
  ```
  lxc.cgroup2.devices.allow: c 10:200 rwm
  lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
  ```
- **LXD / Incus:** `lxc config device add quizzard tun unix-char path=/dev/net/tun`

Check inside the container: `ls -l /dev/net/tun` should show a character device.

## 2. Install the web server
Inside the container, from Debian's own package repository:
```bash
sudo apt-get update
sudo apt-get install nginx openssh-server      # ssh is how you copy the files in (step 6)
sudo rm /etc/nginx/sites-enabled/default      # so nothing is served on port 80
sudo mkdir -p /var/www/quizzard
sudo chown -R "$USER" /var/www/quizzard       # so you can copy files in without sudo
```
Copy `deploy/nginx-quizzard.conf` from this repository to `/etc/nginx/sites-available/quizzard`, then:
```bash
sudo ln -s /etc/nginx/sites-available/quizzard /etc/nginx/sites-enabled/quizzard
sudo nginx -t                                  # must say "syntax is ok"
sudo systemctl reload nginx
```
nginx listens on `127.0.0.1:8080` only, so it is not reachable from your home network.

## 3. Install Tailscale
Use **Tailscale's own package repository** (do not pipe an installer script into a shell). Follow
the Debian instructions on <https://tailscale.com/kb/1031/install-linux>, which at the time of
writing are:
```bash
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt-get update
sudo apt-get install tailscale
```
Then join your tailnet and give the machine a clear name:
```bash
sudo tailscale up --hostname=quizzard
```
Open the login link it prints and approve the machine.

## 4. Put the app online (tailnet only)
```bash
sudo tailscale serve --bg 8080
sudo tailscale serve status
```
This publishes `http://127.0.0.1:8080` over HTTPS on your tailnet, at
`https://quizzard.<your-tailnet>.ts.net`. If it asks you to enable HTTPS, turn it on in the Tailscale
admin console under **DNS**, then run the command again. **Do not use `tailscale funnel`**: that
would put the app on the public internet.

## 5. Give the learner access
1. In the Tailscale admin console, open **Machines**, find `quizzard`, and choose **Share**. Send
   the invite link to the learner. (Sharing a single machine means they do not join your whole
   network.)
2. On their phone: install Tailscale from the official app store, sign in, and accept the share.
3. Open `https://quizzard.<your-tailnet>.ts.net` in the phone's browser.

## 6. Publish the app (and re-publish after changes)
On your PC, in this repository:
```bash
npm run build        # validates the questions, then writes dist/
ssh <user>@quizzard 'rm -rf /var/www/quizzard/*'
scp -r dist/. <user>@quizzard:/var/www/quizzard/
```
`<user>` is your login on the container, and `quizzard` is its Tailscale name (or use its home-network
IP address). The `rm` clears out files from the previous version first. Because the site sends
`Cache-Control: no-cache`, the phone picks up the new version the next time the page is opened.

To change questions: edit the files in `src/data/questions/`, run `npm run validate`, then repeat
the three commands above.

## 7. Check it works
- [ ] On the learner's phone, **with Wi-Fi off** (mobile data), the address opens and a quiz can be completed.
- [ ] From another device on your home network that is **not** on Tailscale, `http://<container-ip>:8080` and `http://<container-ip>` do **not** load.
- [ ] You have not forwarded any port on your router, and `tailscale funnel status` shows nothing enabled.
- [ ] After changing a question and re-publishing, the phone shows the change.

## Taking it down after the exams
1. Admin console → **Machines** → `quizzard` → **Share**: remove the learner's access.
2. In the container: `sudo tailscale serve reset` and `sudo tailscale logout`.
3. Admin console → **Machines** → `quizzard` → **Delete**.
4. Remove the container on the host. **Check the name or ID first, because this is permanent.**
   - Proxmox: `pct stop <CTID>` then `pct destroy <CTID>`
   - LXD / Incus: `lxc stop quizzard` then `lxc delete quizzard`
5. Optionally delete the `dist/` folder and this repository on your PC.

## Out of scope
CI/CD, a custom domain, monitoring and backups. This is a personal, throwaway setup. If it were ever
opened to a wider audience at work, speak to the AI Engineering team first.
