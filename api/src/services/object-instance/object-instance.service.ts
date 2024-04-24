import { Service } from 'typedi';

import { 
  ObjectInstanceRepository, 
  WalletRepository, 
  TransactionRepository,
  MemberRepository } from '../../repositories';
import { ObjectInstancePosition, ObjectInstanceRotation } from 'models';
import { Object } from 'models';

/** Service for dealing with blocks */
@Service()
export class ObjectInstanceService {
  constructor(
    private objectInstanceRepository: ObjectInstanceRepository,
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private memberRepository: MemberRepository) {}

  public async find(objectInstanceId: number): Promise<any> {
    return await this.objectInstanceRepository.find(objectInstanceId);
  }

  public async updateObjectPlacement(
    objectInstanceId: number,
    positionObj: ObjectInstancePosition,
    rotationObj: ObjectInstanceRotation,
  ): Promise<void> {
    const position = JSON.stringify({
      x: Number.parseFloat(positionObj.x),
      y: Number.parseFloat(positionObj.y),
      z: Number.parseFloat(positionObj.z),
    });
    const rotation = JSON.stringify({
      x: Number.parseFloat(rotationObj.x),
      y: Number.parseFloat(rotationObj.y),
      z: Number.parseFloat(rotationObj.z),
      angle: Number.parseFloat(rotationObj.angle),
    });

    return await this.objectInstanceRepository.updateObjectPlacement(
      objectInstanceId,
      position,
      rotation,
    );
  }

  public async updateObjectPlaceId(objectInstanceId: number, placeId: number): Promise<void> {
    return await this.objectInstanceRepository.updateObjectPlaceId(objectInstanceId, placeId);
  }

  public async updateObjectInstanceName(objectId,objectName): Promise<any> {
    return await this.objectInstanceRepository.updateObjectInstanceName(
      objectId, objectName);
  }

  public async updateObjectInstancePrice(objectId,objectPrice): Promise<any> {
    return await this.objectInstanceRepository.updateObjectInstancePrice(
      objectId, objectPrice);
  }

  public async updateObjectInstanceBuyer(objectId,objectBuyer): Promise<any> {
    return await this.objectInstanceRepository.updateObjectInstanceBuyer(
      objectId, objectBuyer);
  }

  public async add(object: Partial<Object>, memberId: number): Promise<any> {
    await this.objectInstanceRepository.create(object.id, object.name, memberId, 0);
  }

  public async getObjectInstanceWithObject(objectInstanceId: number): Promise<any> {
    return await this.objectInstanceRepository.getObjectInstanceWithObject(objectInstanceId);
  }

  public async buyObjectInstance(objectId: number, buyerId: number): Promise<any> {
    const object = await this.objectInstanceRepository.getObjectInstanceWithObject(objectId);
    const sellerWallet= await this.walletRepository.findById(object[0].member_id);
    const buyerWallet = await this.walletRepository.findById(buyerId);
    const buyer = await this.memberRepository.findById(buyerId);

    try{
      if(object[0].object_price){
        if(buyerWallet.balance >= object[0].object_price){
          if(object[0].object_buyer){
            if(buyer.username === object[0].object_buyer.toLowerCase()){
              await this.transactionRepository
                .createObjectSellTransaction(
                  buyerWallet.id, sellerWallet.id, object[0].object_price);
              await this.objectInstanceRepository.updateObjectInstanceOwner(objectId, buyerId);
              return true;
            } else {
              throw new Error('You are not the buyer that is listed on the object.');
            }
          } else {
            await this.transactionRepository
              .createObjectSellTransaction(buyerWallet.id, sellerWallet.id, object[0].object_price);
            await this.objectInstanceRepository.updateObjectInstanceOwner(objectId, buyerId);
            return true;
          }
        } else {
          throw new Error('Insufficient funds');
        }
      } else {
        throw new Error('Object is not for sale');
      }
    } catch(error) {
      console.error(error);
    }
  }
}
