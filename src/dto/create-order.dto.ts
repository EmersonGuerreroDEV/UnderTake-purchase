import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsOptional()
    statusId: number;

    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderDetailDto)
    @IsOptional()
    orderDetails: CreateOrderDetailDto[];
}

export class CreateOrderDetailDto {
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsNumber()
    @IsNotEmpty()
    productId: number;
}
