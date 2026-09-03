import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getMessaging,
} from "firebase-admin/messaging";

import serviceAccount from "./firebase-service-account.json";

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId:
            serviceAccount.project_id,

          clientEmail:
            serviceAccount.client_email,

          privateKey:
            serviceAccount.private_key,
        }),
      })
    : getApps()[0];

export const firebaseMessaging =
  getMessaging(firebaseApp);