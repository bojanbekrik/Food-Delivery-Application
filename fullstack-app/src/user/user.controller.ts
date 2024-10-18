// user.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service'; // Adjust the import path as necessary
import { User } from './user.model'; // Adjust the import path as necessary

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getAllUsers(): Promise<User[]> {
        return await this.userService.getAllUsers();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<User | undefined> {
        return await this.userService.findById(id);
    }

    @Post()
    async addUser(@Body() user: Partial<User>): Promise<User | undefined> {
        if (!user.username) {
            return undefined;
        }
        return await this.userService.createUserAndStoreInFirestore(user.username);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updatedUserFields: Partial<User>,
    ): Promise<User | undefined> {
        return await this.userService.update(id, updatedUserFields);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<void> {
        return await this.userService.delete(id);
    }

    @Post('login')
    async login(@Body() credentials: { username: string }): Promise<User | undefined> {
        const user = await this.userService.findByUsername(credentials.username);
        return user || undefined;
    }
}
