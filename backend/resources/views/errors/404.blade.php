<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 – Page non trouvée</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      background: #FAFAFA;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* Ghost watermark */
    body::before {
      content: '404';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: clamp(180px, 38vw, 380px);
      font-weight: 900;
      letter-spacing: -0.05em;
      color: transparent;
      -webkit-text-stroke: 2px rgba(251, 57, 54, 0.055);
      line-height: 1;
      pointer-events: none;
      user-select: none;
      white-space: nowrap;
    }

    /* Track strip bottom */
    body::after {
      content: '';
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: #FB3936;
    }

    .track {
      position: fixed;
      bottom: 5px;
      left: 0;
      right: 0;
      height: 20px;
      background-image: repeating-linear-gradient(
        90deg,
        transparent 0, transparent 20px,
        rgba(251, 57, 54, .18) 20px, rgba(251, 57, 54, .18) 24px
      );
      animation: trackScroll 1.4s linear infinite;
    }

    .content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* Logo */
    .logo {
      width: 140px;
      height: 140px;
      object-fit: contain;
      margin-bottom: 2.25rem;
      filter: drop-shadow(0 8px 28px rgba(251, 57, 54, 0.28));
      animation: floatLogo 4s ease-in-out infinite;
      opacity: 0;
      animation-name: floatLogoFadeIn, floatLogo;
      animation-duration: 0.65s, 4s;
      animation-delay: 0.05s, 0.7s;
      animation-timing-function: ease, ease-in-out;
      animation-fill-mode: forwards, none;
      animation-iteration-count: 1, infinite;
    }

    /* Race bib */
    .bib {
      position: relative;
      display: inline-block;
      background: #FB3936;
      border-radius: 18px;
      padding: 1.1rem 3rem;
      margin-bottom: 2rem;
      box-shadow: 0 16px 48px rgba(251, 57, 54, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.18);
      opacity: 0;
      animation: fadeUp 0.65s ease 0.2s forwards;
    }

    .bib-eyelet {
      position: absolute;
      top: -9px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #FAFAFA;
      border: 2.5px solid rgba(251, 57, 54, 0.25);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .bib-eyelet:first-child { left: 28px; }
    .bib-eyelet:last-child  { right: 28px; }

    .bib-number {
      display: block;
      font-size: clamp(3.75rem, 12vw, 6.5rem);
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.05em;
      line-height: 1;
    }

    .bib-label {
      display: block;
      margin-top: 0.3rem;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.65);
    }

    h1 {
      font-size: clamp(1.5rem, 4.5vw, 2.25rem);
      font-weight: 800;
      color: #1A1A1A;
      line-height: 1.15;
      margin-bottom: 0.9rem;
      opacity: 0;
      animation: fadeUp 0.65s ease 0.35s forwards;
    }

    .subtitle {
      color: #7F7F7F;
      font-size: 1rem;
      line-height: 1.75;
      max-width: 360px;
      margin-bottom: 2.5rem;
      opacity: 0;
      animation: fadeUp 0.65s ease 0.5s forwards;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #FB3936;
      color: #fff;
      padding: 0.9rem 2.1rem;
      border-radius: 100px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: 0 4px 22px rgba(251, 57, 54, 0.28);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      opacity: 0;
      animation: fadeUp 0.65s ease 0.65s forwards;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 36px rgba(251, 57, 54, 0.38);
      background: #D42F2D;
    }

    .btn svg {
      flex-shrink: 0;
    }

    @keyframes floatLogoFadeIn {
      from { opacity: 0; transform: translateY(22px) rotate(-2deg); }
      to   { opacity: 1; transform: translateY(0)    rotate(-2deg); }
    }

    @keyframes floatLogo {
      0%, 100% { transform: translateY(0)    rotate(-2deg); }
      50%       { transform: translateY(-12px) rotate(2deg);  }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    @keyframes trackScroll {
      from { background-position: 0 0;    }
      to   { background-position: 48px 0; }
    }
  </style>
</head>
<body>

  <div class="track" aria-hidden="true"></div>

  <div class="content">

    <img
      src="/logo.png"
      alt="La Neuville TAF sa Foulée"
      class="logo"
      width="140"
      height="140"
    >

    <div class="bib" aria-hidden="false">
      <div class="bib-eyelet"></div>
      <div class="bib-eyelet"></div>
      <span class="bib-number">404</span>
      <span class="bib-label">Page non trouvée</span>
    </div>

    <h1>Vous avez pris un mauvais virage&nbsp;!</h1>

    <p class="subtitle">
      Cette page n'est pas sur le parcours.<br>
      Retournez à la ligne de départ et reprenez votre élan.
    </p>

    <a href="/" class="btn">
      Retour à l'accueil
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9.5 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>

  </div>

</body>
</html>
