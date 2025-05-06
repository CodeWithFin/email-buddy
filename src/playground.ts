import { db } from "./server/db";

await db.user.create({
  data: {
    emailAddress: 'test@gmail.com',
    firstName: 'elliott',
    lastName: 'chong' // Fixed: no space
  }
});

console.log('done');
