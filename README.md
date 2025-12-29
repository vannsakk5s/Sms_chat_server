
# 🚀 Sms_chat_server (Backend API)

Sms_chat_server គឺជាប្រព័ន្ធ Backend សម្រាប់កម្មវិធីផ្ញើសារ (SMS Chat App) ដែលបង្កើតឡើងដោយប្រើ **Node.js** និង **Express/NestJS**។  
វាមានតួនាទីសំខាន់ក្នុងការគ្រប់គ្រង **Business Logic**, ការរក្សាទុកទិន្នន័យទៅក្នុង **Database** និងការធានា **សុវត្ថិភាព** សម្រាប់អ្នកប្រើប្រាស់។

---

## 📂 Project Structure

រចនាសម្ព័ន្ធគម្រោងត្រូវបានរៀបចំដូចខាងក្រោម៖

```bash
src/
├── controllers/ # ទទួល Request ពី Client និងបញ្ជូន Response 
├── models/ # Schema សម្រាប់ Database
├── routes/ # កំណត់ API Endpoints
├── services/ # Business Logic សំខាន់ៗ
├── middleware/ # Middleware (Auth, Validation, etc.)
├── config/ # DB Connection និង App Config
.env # Environment Variables
package.json # Dependencies និង Scripts
```


---

## 🛠 Installation & Setup

### ចូលទៅកាន់ Folder Backend
```bash
cd backend
```

## ដំឡើង Dependencies
```bash
npm install
```
កំណត់ Environment Variables

## បង្កើតឯកសារ .env ហើយបន្ថែមព័ត៌មានខាងក្រោម៖

```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_ke
```

## ដំណើរការ Application
# Development mode
```bash
npm run dev
```

# Production mode
```bash
npm start
```

🔐 Security & Authentication

## JWT (JSON Web Token)
```bash
    - ប្រើសម្រាប់បញ្ជាក់អត្តសញ្ញាណអ្នកប្រើប្រាស់ពេលហៅ API
    - Password Hashing ប្រើ Bcrypt ដើម្បី Hash លេខសម្ងាត់មុនរក្សាទុកក្នុង Database
    - CORS កំណត់អោយតែ Frontend ដែលអនុញ្ញាតប៉ុណ្ណោះអាច Access API បាន

## API Endpoints

Method
    - POST
    - POST
    - GET	
    - POST

Endpoint
    - /api/auth/register
    - /api/auth/login
    - /api/chat/messages
    - /api/chat/send
    ```