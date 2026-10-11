"""Builds index.html (GitHub Pages) and preview.html from src/app.html."""
import base64, pathlib
root = pathlib.Path(__file__).parent
src = (root / "src/app.html").read_text()
logo = "data:image/webp;base64," + base64.b64encode((root / "logo.webp").read_bytes()).decode()
src = src.replace("__LOGO__", logo)
head, body = src.split("<!--BODY-->")
(root / "preview.html").write_text(head + body)
page = f"""<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a0a0b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Market Ledger">
<link rel="icon" type="image/png" href="./icons/ml-192.png">
<link rel="manifest" href="./manifest.webmanifest?v=4">
<link rel="apple-touch-icon" sizes="180x180" href="./icons/ml-180.png">
<link rel="apple-touch-icon" href="./icons/ml-192.png">
{head.strip()}
</head>
<body>
{body.strip()}
<script>if('serviceWorker' in navigator){{addEventListener('load',function(){{navigator.serviceWorker.register('sw.js').catch(function(){{}})}})}}</script>
</body>
</html>
"""
(root / "index.html").write_text(page)
print("built", len(page))
