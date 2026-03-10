"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCard = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let CustomerCard = class CustomerCard {
};
exports.CustomerCard = CustomerCard;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerCard.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uniqueidentifier' }),
    __metadata("design:type", String)
], CustomerCard.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", user_entity_1.User)
], CustomerCard.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20 }),
    __metadata("design:type", String)
], CustomerCard.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 4 }),
    __metadata("design:type", String)
], CustomerCard.prototype, "last4", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CustomerCard.prototype, "expiryMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CustomerCard.prototype, "expiryYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 80 }),
    __metadata("design:type", String)
], CustomerCard.prototype, "holderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], CustomerCard.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerCard.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerCard.prototype, "updatedAt", void 0);
exports.CustomerCard = CustomerCard = __decorate([
    (0, typeorm_1.Entity)('customer_cards')
], CustomerCard);
//# sourceMappingURL=customer-card.entity.js.map