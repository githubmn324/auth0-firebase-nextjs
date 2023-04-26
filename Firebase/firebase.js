import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBJSIFyuqKWF06rjGYwgERXxaaz_fxI2_E",
    authDomain: "kaigofika-poc01.firebaseapp.com",
    projectId: "kaigofika-poc01",
    storageBucket: "kaigofika-poc01.appspot.com",
    messagingSenderId: "901508578456",
    appId: "1:901508578456:web:aa06b827829b91b373e4ed"
};

export const app = initializeApp(firebaseConfig);
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const cloudStorage = getStorage(app);
// export const orgCloudStorage = getStorage(app, `gs://kaigofika-poc01.appspot.com/${org_id}`);

export const signInFirebase = async () => {
    console.log({
        method: "signInFirebase",
        message: "entering"
    })
    const response = await fetch('/api/firebase');
    const data = await response.json();
    console.log({
        method: "fetch '/api/firebase'",
        result: data
    })

    signInWithCustomToken(auth, data.firebaseToken)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log({
                method: "signInWithCustomToken",
                message: "Firebase Sign-in successful",
                userCredential: userCredential,
                idToken: userCredential["_tokenResponse"]["idToken"]
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log({
                method: "signInWithCustomToken",
                message: "Firebase Sign-in failed",
                error: `errorCode: ${errorCode} errorMessage: ${errorMessage}`
            });
        });
}

export const signOutFirebase = () => {
    signOut(auth)
        .then(() => {
            // Sign-out successful.
            console.log("Firebase Sign-out successful");
        }).catch((error) => {
            // An error happened.
            console.log("Firebase Sign-out faild");
            console.log(error);
        });
}
