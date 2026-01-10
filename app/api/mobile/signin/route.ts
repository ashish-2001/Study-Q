import db from ''@/db;
import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import { z } from "zod";
import { importJWK, JWTPayload, SignJWT } from 'jose';

const requestBodySchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const generateJWT = async (payload: JWTPayload) => {
    const secret = process.env.JWT_SECRET || '';
    const jwk = await importJWK({
        k: secret, alg: 'HS256', kty: 'oct'
    });

    const jwt = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('365d')
    .sign(jwk);

    return jwt
};

export async function POST(req: NextRequest){
    const authKey = req.headers.get('Auth-key');
    if(authKey !== process.env.EXTERNAL_LOGIN_AUTH_SECRET){
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try{
        const body = await req.json();
        const parseResult = requestBodySchema.safeParse(body);

        if(!parseResult.success){
            return NextResponse.json({
                message: 'Invalid input',
                errors: parseResult.error
            }, {
                status: 400
            });
        };

        const { email, password = parseResult.data;

            const user = await db.user.findFirst({
                where: {
                    email
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true
                }
            });

            if(!user){
                return NextResponse.json({
                    message: 'User not found'
                }, {
                    status: 404
                });
            }

            if(user && user.password && password && (await bcrypt.compare(password, user.password))){
                const jwt = await generateJWT({
                    id: user.id,
                    email: user.email
                });

                return NextResponse.json({
                    message: 'User found',
                    data: {
                        user: {
                            id: {
                                user.id,
                                email: user.email,
                                name: user.name
                            },
                            token: jwt
                        }
                    }
                });
            }
        } catch(e){
            return NextResponse.json({
                message: `Error fetching user ${e}`
            }, {
                status: 500
            })
        }
    }
}