import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, correo } = createUserDto;
    const userExists = await this.userModel.findOne({ correo });

    if (userExists) throw new BadRequestException('Correo ya registrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await user.updateOne(updateUserDto);
    return { message: 'Usuario actualizado' };
  }

  async toggleActive(id: string, activo: boolean) {
    const user = await this.findOne(id);
    await user.updateOne({ activo });
    return { message: `Usuario ${activo ? 'activado' : 'desactivado'}` };
  }

  async findByEmail(correo: string) {
    return this.userModel.findOne({ correo });
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.userModel.findByIdAndUpdate(id, { refreshToken });
  }
}