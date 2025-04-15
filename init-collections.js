const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeCollections() {
  try {
    // Initialize feedback collection
    await addDoc(collection(db, "feedback"), {
      rating: 5,
      comment: "Test feedback",
      userId: "test-user",
      page: "/welcome",
      timestamp: Date.now()
    });

    // Initialize chats collection
    await addDoc(collection(db, "chats"), {
      userId: "test-user",
      title: "Test Chat",
      messages: [
        {
          id: "1",
          role: "user",
          content: "Test message"
        }
      ],
      timestamp: Date.now()
    });

    console.log("Collections initialized successfully!");
  } catch (error) {
    console.error("Error initializing collections:", error);
  }
}

initializeCollections();
