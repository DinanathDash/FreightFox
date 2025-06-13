import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
// Import card logos
import VisaLogo from '../../assets/visa.svg';
import MastercardLogo from '../../assets/mastercard.svg';
import AmexLogo from '../../assets/amex.svg';
import RupayLogo from '../../assets/rupay.svg';
import PaytmLogo from '../../assets/paytm.svg';
import PhonePeLogo from '../../assets/phonepe.svg';
import GPayLogo from '../../assets/gpay.svg';
import AmazonPayLogo from '../../assets/amazonpay.svg';

const paymentMethods = [
	{
		id: 'card',
		name: 'Credit / Debit Card',
		description: 'Pay securely with your card',
		icons: [
			{ src: VisaLogo, alt: 'Visa' },
			{ src: MastercardLogo, alt: 'Mastercard' },
			{ src: AmexLogo, alt: 'American Express' },
			{ src: RupayLogo, alt: 'RuPay' }
		]
	},
	{
		id: 'upi',
		name: 'UPI Payment',
		description: 'Google Pay, PhonePe, Paytm, and more',
		icons: [
			{ src: GPayLogo, alt: 'Google Pay' },
			{ src: PhonePeLogo, alt: 'PhonePe' },
			{ src: PaytmLogo, alt: 'Paytm' }
		]
	},
	{
		id: 'netbanking',
		name: 'Net Banking',
		description: 'Pay via your bank account',
		icon: '🏦'
	},
	{
		id: 'wallet',
		name: 'Wallet',
		description: 'Paytm, PhonePe, Amazon Pay',
		icons: [
			{ src: PaytmLogo, alt: 'Paytm' },
			{ src: PhonePeLogo, alt: 'PhonePe' },
			{ src: AmazonPayLogo, alt: 'Amazon Pay' }
		]
	},
	{
		id: 'cod',
		name: 'Cash on Delivery',
		description: 'Pay when you receive your order',
		icon: '💰'
	}
];

function PaymentMethodSelector({ onSelect, selectedMethod = 'card', disabled = false }) {
	return (
		<Card className="mx-auto max-w-full sm:max-w-none">
			<CardHeader className="px-3 sm:px-6">
				<CardTitle className="text-lg sm:text-xl">Select Payment Method</CardTitle>
			</CardHeader>
			<CardContent className="px-3 sm:px-6">
				<RadioGroup
					value={selectedMethod}
					onValueChange={onSelect}
					className="space-y-2"
				>
					{paymentMethods.map(method => (
						<div
							key={method.id}
							className={`flex items-center space-x-2 sm:space-x-3 border rounded-lg p-2 sm:p-3 ${selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-input'}`}
						>
							<RadioGroupItem value={method.id} id={method.id} disabled={disabled} />
							<Label htmlFor={method.id} className="flex-1 cursor-pointer">
								<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
									<div className="flex-shrink-0">
										<div className="font-medium text-sm sm:text-base">{method.name}</div>
										<div className="text-xs sm:text-sm text-muted-foreground">{method.description}</div>
									</div>
									{method.icons ? (
										<div className="flex space-x-2 sm:space-x-4 flex-shrink-0 sm:ml-4 mt-2 sm:mt-0">
											{method.icons.map((icon, index) => (
												<img
													key={index}
													src={icon.src}
													alt={icon.alt}
													className="h-4 sm:h-6 w-auto"
												/>
											))}
										</div>
									) : (
										<div className="text-lg sm:text-xl flex-shrink-0 sm:ml-4 mt-2 sm:mt-0">{method.icon}</div>
									)}
								</div>
							</Label>
						</div>
					))}
				</RadioGroup>
			</CardContent>
		</Card>
	);
}

export default PaymentMethodSelector;
