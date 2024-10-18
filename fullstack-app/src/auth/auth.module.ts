import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';

@Module({
    controllers: [AuthController],
    providers: [UserService],
    exports: [UserService],  // Export UserService so other modules can use it
})
export class AuthModule {}
