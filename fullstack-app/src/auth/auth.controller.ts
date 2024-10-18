import { Body, Controller, Post, Req } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as admin from 'firebase-admin';

@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UserService) {}

    @Post('login')
    async login(@Body() body: { token: string }) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(body.token);
            const user = await this.usersService.findByUsername(decodedToken.email);

            if (user) {
                return { id: user.id, username: user.username };
            } else {
                return { message: 'User not found', statusCode: 404 };
            }
        } catch (error) {
            return { message: 'Invalid token', statusCode: 401 };
        }
    }
}
