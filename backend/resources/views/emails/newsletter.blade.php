<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $subject }}</title>
  <style>
    body { margin: 0; padding: 0; background: #F8F8F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; }
    .header {
      background: #C0302E;
      border-radius: 16px 16px 0 0;
      padding: 28px 36px;
      text-align: center;
    }
    .header-logo { font-size: 22px; font-weight: 800; color: #F4C4C0; letter-spacing: -0.01em; }
    .header-logo span { font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.5); }
    .body {
      background: white;
      padding: 36px;
      border-left: 1px solid rgba(192,48,46,0.08);
      border-right: 1px solid rgba(192,48,46,0.08);
    }
    .greeting { font-size: 16px; color: #1A1A1A; margin-bottom: 24px; }
    .content { font-size: 15px; line-height: 1.7; color: #2C2C2C; }
    .footer {
      background: #F8F8F8;
      border: 1px solid rgba(192,48,46,0.08);
      border-top: none;
      border-radius: 0 0 16px 16px;
      padding: 20px 36px;
      text-align: center;
    }
    .footer p { font-size: 12px; color: #7F7F7F; margin: 4px 0; }
    .unsubscribe { color: #FB3936; text-decoration: none; font-weight: 600; }
    .unsubscribe:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo"><span>sa </span>Foulée</div>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:6px 0 0;">La Neuville TAF sa Foulée</p>
    </div>

    <div class="body">
      <p class="greeting">Bonjour {{ $recipientName }},</p>
      <div class="content">{!! $bodyHtml !!}</div>
    </div>

    <div class="footer">
      <p>La Neuville TAF sa Foulée</p>
      <p>Tu reçois cet email car tu es abonné(e) à notre newsletter.</p>
      <p>
        <a href="{{ $unsubscribeUrl }}" class="unsubscribe">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
