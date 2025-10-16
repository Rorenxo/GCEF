import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { deleteDoc } from "firebase/firestore" 

const firebaseConfig = {
  apiKey: "AIzaSyCG1HsNqPK20CgZuvDlWu3NCsVihPuEc80",
  authDomain: "gcef-01023.firebaseapp.com",
  databaseURL: "https://gcef-01023-default-rtdb.firebaseio.com",
  projectId: "gcef-01023",
  storageBucket: "gcef-01023.firebasestorage.app",
  messagingSenderId: "796713752559",
  appId: "1:796713752559:web:7cf53d9f7166a5b853c81a",
  measurementId: "G-SV3QM5Z5QZ",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)


export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export { deleteDoc } 


export default app