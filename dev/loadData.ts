import { db } from '../src/services/firebase';
import testData from './testData.json';

const loadData = () => {
  const batch = db.bulkWriter();

  Object.entries(testData.zoomAccounts).forEach(([key, value]) => {
    const docRef = db.doc(`zoomAccounts/${key}`);
    batch.set(docRef, value);
  });

  batch.close();
};

loadData();
