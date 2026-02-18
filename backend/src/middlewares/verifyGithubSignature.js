import crypto from "crypto";

export const verifyGithubSignature = (req, res, next) => {
  const body = req.rawBody
    ? req.rawBody.toString("utf-8")
    : JSON.stringify(req.body);

  const signature = req.headers["x-hub-signature-256"];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature) {
    return res.status(401).json({ message: "Missing signature" });
  }
  if (!secret) {
    console.error("GITHUB_WEBHOOK_SECRET is not set in .env");
    return res.status(500).json({ message: "Server misconfigured" });
  }

  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");

  const expectedSignature = `sha256=${hash}`;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  next();
};
