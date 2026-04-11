import Razorpay from "razorpay";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";

export const PLANS = {
  plan_Sad3I17gtXn9Wp: {
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_Sad9EA5weax25d: {
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_Sad4YE1ot5kzZb: {
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_SadA5Adrn3xmw4: {
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_Sad7MbJ80NTKh0: {
    storageQuotaBytes: 10 * 1024 ** 4,
  },
  plan_SadAvA4VR0Z8gE: {
    storageQuotaBytes: 10 * 1024 ** 4,
  },
};

export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const isSignatureValid = Razorpay.validateWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );
  if (isSignatureValid) {
    console.log("Signature verified");

    console.log(req.body);
    if (req.body.event === "subscription.activated") {
      const rzpSubscription = req.body.payload.subscription.entity;
      const planId = rzpSubscription.plan_id;
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: rzpSubscription.id,
      });
      subscription.status = rzpSubscription.status;
      await subscription.save();
      const storageQuotaBytes = PLANS[planId].storageQuotaBytes;
      const user = await User.findById(subscription.userId);
      user.maxStorageInBytes = storageQuotaBytes;
      await user.save();
      console.log("subscription activated");
    }
  } else {
    console.log("Signature not verified");
  }
  res.end("OK");
};
