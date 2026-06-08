Even if the project isn't "live" on the internet yet, other PCs can communicate with your laptop's server as long as they are connected to the same Wi-Fi or Local Area Network (LAN) .

Here is exactly how to set it up:

### 1. Make the Server "Listen" to the Network
By default, most servers only talk to the computer they are on ( localhost ). To let other PCs in, you must tell the server to "listen" to everything.

Run your Web Admin server with this command:

```
php artisan serve --host 0.0.0.0 
--port 8000
```
Using 0.0.0.0 tells your laptop: "Accept connections from any device on this Wi-Fi."

### 2. Get your Laptop's LAN IP
You already found this earlier! Your laptop's address on your current network is: 192.168.55.111

### 3. Configure the Other PC
On the other computer where you installed the Desktop App :

1. Open the app to the Activation Screen .
2. Click the Gear Icon ⚙️.
3. Enter the URL: http://192.168.55.111:8000/api
4. Click Save Settings .
### 4. Important: Open your Windows Firewall
This is the most common reason it fails. Your laptop's Firewall might block the other PC.

1. On your laptop, go to Windows Search and type "Allow an app through Windows Firewall".
2. Find PHP or Apache (whichever is running the server).
3. Make sure both "Private" and "Public" checkboxes are checked.
4. Alternative: Temporarily turn off your laptop's Firewall just to test if they can talk to each other.
### Summary of how it works:
- Your Laptop : Acts as the "Cloud Hub."
- Other PCs : Connect to your laptop using your LAN IP ( 192.168.55.111 ) instead of a website name.
- Limit : This only works while they are on the same Wi-Fi. If you take the other PC to a different building, it won't connect until you put the server on a "Live" website.