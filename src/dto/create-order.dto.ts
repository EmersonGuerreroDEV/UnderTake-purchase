import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsNumber()
    @IsOptional()
    statusId: number;

    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsNumber()
    @IsNotEmpty()
    paymentMethod: number


    @IsString()
    @IsNotEmpty()
    address: string


    @IsString()
    @IsNotEmpty()
    cityId: string

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


    @IsNumber()
    @IsNotEmpty()
    variantId: number;
}
