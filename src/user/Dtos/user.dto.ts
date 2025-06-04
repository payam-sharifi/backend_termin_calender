import { IsString, IsInt, IsBoolean } from 'class-validator';

export class UserDto{
    
    
    @IsString()
    name :string                
    @IsString()
    email  :string  
    @IsString()            
    phone  :string  
    @IsString()            
    sex     :string  
    @IsString()           
    password   :string    
    @IsString()      
    role    :string     
    @IsBoolean()              
    is_verified  :boolean        
           
}