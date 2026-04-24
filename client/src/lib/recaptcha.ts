const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let recaptchaLoad: Promise<void> | null = null;

function loadRecaptcha() {
  if (!SITE_KEY) {
    throw new Error("Contact form reCAPTCHA is not configured.");
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (!recaptchaLoad) {
    recaptchaLoad = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load reCAPTCHA."));
      document.head.appendChild(script);
    });
  }

  return recaptchaLoad;
}

export async function getRecaptchaToken(action = "contact") {
  await loadRecaptcha();

  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) {
    throw new Error("reCAPTCHA did not initialize.");
  }

  return new Promise<string>((resolve, reject) => {
    grecaptcha.ready(async () => {
      try {
        resolve(await grecaptcha.execute(SITE_KEY, { action }));
      } catch (err) {
        reject(err);
      }
    });
  });
}
