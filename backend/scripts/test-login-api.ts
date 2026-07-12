import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const prisma = new PrismaClient();
const JWT_SECRET = 'ueikGJAFa3UUatpOeodHaCoKT+7kJQ0DPAqvcDTUoVc=';

// Create a mini Express server to test login
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/test-login', async (req, res) => {
    const { email, password } = req.body;

    console.log('📝 Login request:', { email });

    const user = await prisma.userProfile.findUnique({ where: { email } });

    if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);
    console.log('🔑 Has password:', !!user.password);

    if (password && user.password) {
        const isValid = await bcrypt.compare(password, user.password);
        console.log('🔓 Password valid:', isValid);

        if (isValid) {
            const token = jwt.sign(
                { sub: user.authId, id: user.id, email: user.email, role: user.userType },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                accessToken: token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.userType
                }
            });
        }
    }

    return res.status(401).json({ error: 'Invalid credentials' });
});

const PORT = 4001;
app.listen(PORT, () => {
    console.log(`\n🧪 Test server running on http://localhost:${PORT}`);
    console.log(`   Test: POST http://localhost:${PORT}/test-login`);
    console.log(`   Body: {"email":"owner@kingdom.com","password":"123456"}\n`);
});