# Sms_chat_server
🚀 Sms_chat_server (Backend API)នេះគឺជាប្រព័ន្ធ Backend សម្រាប់កម្មវិធីផ្ញើសារ (SMS Chat App) ដែលបង្កើតឡើងដោយប្រើប្រាស់ Node.js និង Express/NestJS។ វាដើរតួនាទីយ៉ាងសំខាន់ក្នុងការគ្រប់គ្រង Business Logic, ការរក្សាទុកទិន្នន័យទៅក្នុង Database និងការធានាសុវត្ថិភាពដល់អ្នកប្រើប្រាស់។📂 រចនាសម្ព័ន្ធគម្រោង (Project Structure)ផ្អែកតាមការរៀបចំរបស់អ្នក គម្រោងនេះត្រូវបានបែងចែកដូចខាងក្រោម៖src/controllers/: សម្រាប់ទទួល Request ពី Client និងបញ្ជូន Response ត្រឡប់ទៅវិញ។src/models/: កំណត់ Schema សម្រាប់ទិន្នន័យក្នុង Database។src/routes/: កំណត់ផ្លូវ (Endpoints) នៃ API នីមួយៗ។src/services/: កន្លែងសម្រាប់សរសេរ Logic សំខាន់ៗរបស់កម្មវិធី។src/middleware/: សម្រាប់ឆែកសុវត្ថិភាព (ឧទាហរណ៍៖ Auth check) មុននឹងឱ្យចូលទៅកាន់ API។src/config/: រក្សាការកំណត់ផ្សេងៗដូចជា ការភ្ជាប់ជាមួយ DB ឬ Env config។.env: សម្រាប់រក្សាសម្ងាត់ដូចជា DB URL និង JWT Secret។package.json: បញ្ជីបណ្ណាល័យ (Libraries) ដែលបានដំឡើងក្នុងគម្រោង។🛠 ការដំឡើង និងដំណើរការ (Installation & Setup)១. ចូលទៅកាន់ Folder Backend:Bashcd backend
២. ដំឡើង Dependencies:Bashnpm install
៣. កំណត់ Environment Variables:បង្កើត file .env រួចបន្ថែមព័ត៌មានចាំបាច់៖Code snippetPORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
៤. ដំណើរការកម្មវិធី:Bash# សម្រាប់បៀប Development
npm run dev

# សម្រាប់របៀប Production
npm start
🔐 ប្រព័ន្ធសុវត្ថិភាព និង AuthenticationJWT (JSON Web Token): ប្រើសម្រាប់បញ្ជាក់អត្តសញ្ញាណអ្នកប្រើប្រាស់រាល់ពេលហៅ API។Password Hashing: ប្រើប្រាស់ Bcrypt ដើម្បីរក្សាសុវត្ថិភាពលេខសម្ងាត់ក្នុង Database។CORS: ត្រូវបានកំណត់ដើម្បីអនុញ្ញាតឱ្យតែ Frontend របស់អ្នកអាចទាក់ទងមកបាន។📡 API Endpoints សំខាន់ៗMethodEndpointDescriptionPOST/api/auth/registerចុះឈ្មោះគណនីថ្មីPOST/api/auth/loginចូលប្រើប្រាស់ប្រព័ន្ធGET/api/chat/messagesទាញយកសារចាស់ៗPOST/api/chat/sendផ្ញើសារថ្មី