# Sms_chat_server
backend/
├── src/
│   ├── controllers/    # សម្រាប់ទទួល Request និងបញ្ជូន Response
│   ├── models/         # Schema សម្រាប់ Database
│   ├── routes/         # កំណត់ផ្លូវនៃ API (Endpoints)
│   ├── services/       # Logic សំខាន់ៗនៃកម្មវិធី
│   ├── middleware/     # ការពារ Route (ឧទាហរណ៍៖ Auth check)
│   └── config/         # ការកំណត់ផ្សេងៗ (DB Connection, Env)
├── .env                # រក្សាសម្ងាត់ដូចជា DB URL, JWT Secret
└── package.json        # បញ្ជីបណ្ណាល័យដែលបានដំឡើង