import React, { useState } from 'react';
import { PrototypeBanner } from './components/PrototypeBanner';
import { PhoneStatusBar } from './components/PhoneStatusBar';
import { HomeScreen } from './components/HomeScreen';
import { BillerSelectStep } from './components/BillerSelectStep';
import { ConsumerInputStep } from './components/ConsumerInputStep';
import { BillReviewCard } from './components/BillReviewCard';
import { FriendSelectStep } from './components/FriendSelectStep';
import { MerchantSelectStep } from './components/MerchantSelectStep';
import { NewUserPayStep } from './components/NewUserPayStep';
import { P2PSafetyCheckStep } from './components/P2PSafetyCheckStep';
import { PreAuthReviewScreen } from './components/PreAuthReviewScreen';
import { TwoStepVerificationStep } from './components/TwoStepVerificationStep';
import { DeviceVerificationStep } from './components/DeviceVerificationStep';
import { UpiPinModal } from './components/UpiPinModal';
import { TransactionReceipt } from './components/TransactionReceipt';
import { BillerDirectoryModal } from './components/BillerDirectoryModal';
import { ScamEducationModal } from './components/ScamEducationModal';
import { TransactionHistoryDrawer } from './components/TransactionHistoryDrawer';
import { parseUserQuery } from './utils/nlpParser';
import { DEMO_VERIFIED_BILLERS } from './data/mockBillers';
import { sound } from './utils/audioEffects';
import { Smartphone, Monitor, Volume2, VolumeX, ShieldCheck, Users, Store, UserPlus } from 'lucide-react';
export function App() {
    const [isMobileFrame, setIsMobileFrame] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
    const [isScamGuideOpen, setIsScamGuideOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState('home');
    const [showUpiPinModal, setShowUpiPinModal] = useState(false);
    const [activeQueryText, setActiveQueryText] = useState('');
    const [paymentType, setPaymentType] = useState('BILL');
    const [activeCategory, setActiveCategory] = useState('electricity');
    const [selectedBiller, setSelectedBiller] = useState(null);
    const [fetchedBill, setFetchedBill] = useState(null);
    const [p2pRecipient, setP2pRecipient] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(500);
    const [safetyCheckResult, setSafetyCheckResult] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    const [transactions, setTransactions] = useState([
        {
            id: 'TX-DEMO-001',
            date: '2026-10-18 10:24 AM',
            type: 'BILL',
            title: 'Electricity Bill Payment',
            subtitle: 'Adani Electricity Mumbai',
            amount: 2480.00,
            billerOrRecipient: 'Adani Electricity Mumbai Limited',
            accountReference: 'Consumer No: 100482910',
            status: 'COMPLETED',
            utrNumber: 'DEMO-UTR-849204918234',
            paymentMethod: 'Demo HDFC Bank •••• 4092',
            verificationTag: 'BBPS Verified',
        },
        {
            id: 'TX-DEMO-002',
            date: '2026-10-22 04:15 PM',
            type: 'P2P',
            title: 'Transfer to Priya Verma',
            subtitle: 'Personal Transfer',
            amount: 1200.00,
            billerOrRecipient: 'PRIYA VERMA',
            accountReference: 'priya.verma@icici',
            status: 'COMPLETED',
            utrNumber: 'DEMO-UTR-991204859102',
            paymentMethod: 'Demo HDFC Bank •••• 4092',
            verificationTag: 'Demo profile match',
            warningNote: 'Sample profile match (simulated).',
        },
    ]);
    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        sound.enabled = next;
        if (next)
            sound.playTap();
    };
    const handleUserPrompt = (promptText) => {
        setActiveQueryText(promptText);
        const parsed = parseUserQuery(promptText);
        if (parsed.type === 'FRIENDS') {
            setPaymentType('P2P');
            if (parsed.amount)
                setPaymentAmount(parsed.amount);
            setCurrentStep('friend_select');
        }
        else if (parsed.type === 'MERCHANT') {
            setPaymentType('MERCHANT');
            if (parsed.amount)
                setPaymentAmount(parsed.amount);
            setCurrentStep('merchant_select');
        }
        else if (parsed.type === 'NEW_USER') {
            setPaymentType('P2P');
            if (parsed.amount)
                setPaymentAmount(parsed.amount);
            setCurrentStep('new_user_input');
        }
        else if (parsed.type === 'BILL') {
            setPaymentType('BILL');
            setActiveCategory(parsed.category || 'electricity');
            if (parsed.billerId) {
                const found = DEMO_VERIFIED_BILLERS.find((b) => b.id === parsed.billerId);
                if (found) {
                    setSelectedBiller(found);
                    setCurrentStep('consumer_input');
                    return;
                }
            }
            setCurrentStep('biller_selection');
        }
        else if (parsed.type === 'P2P') {
            setPaymentType('P2P');
            setP2pRecipient(parsed.resolvedRecipient || null);
            setPaymentAmount(parsed.amount || 500);
            setCurrentStep('p2p_safety_check');
        }
        else {
            setPaymentType('BILL');
            setActiveCategory('electricity');
            setCurrentStep('biller_selection');
        }
    };
    // Friend Selection Handler
    const handleFriendSelected = (friend, amount) => {
        setPaymentAmount(amount);
        const recipient = {
            upiId: friend.upiId,
            resolvedName: friend.name.toUpperCase(),
            bankName: friend.bankName,
            accountMatched: true,
            matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
            isFriendContact: true,
            friendVerification: {
                isVerifiedUser: friend.isVerifiedUser,
                statusBadge: friend.verificationBadge,
                kycCompleted: friend.kycCompleted,
                aadhaarLinked: friend.aadhaarLinked,
                accountAgeMonths: friend.accountAgeMonths,
                explanation: friend.explanation,
            },
        };
        setP2pRecipient(recipient);
        // If friend is unverified, route through first-payment safety check
        if (!friend.isVerifiedUser) {
            setCurrentStep('p2p_safety_check');
        }
        else {
            setCurrentStep('pre_auth_review');
        }
    };
    // Merchant Selection Handler
    const handleMerchantSelected = (merchant, amount) => {
        setPaymentType('MERCHANT');
        setPaymentAmount(amount);
        const recipient = {
            upiId: merchant.upiId,
            resolvedName: merchant.businessName,
            bankName: 'Commercial Merchant Gateway',
            accountMatched: true,
            matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
            isMerchant: true,
            merchantVerification: merchant.verification,
        };
        setP2pRecipient(recipient);
        // If merchant is unverified, trigger safety screening
        if (!merchant.verification.isVerifiedMerchant) {
            setCurrentStep('p2p_safety_check');
        }
        else {
            setCurrentStep('pre_auth_review');
        }
    };
    // New User Handler
    const handleNewUserProceed = (recipient, amount) => {
        setPaymentType('P2P');
        setPaymentAmount(amount);
        setP2pRecipient(recipient);
        setCurrentStep('p2p_safety_check');
    };
    // Bill Fetch Handler
    const handleBillFetched = (bill) => {
        setFetchedBill(bill);
        setPaymentAmount(bill.billAmount);
        setCurrentStep('bill_review');
    };
    // P2P Safety Check Proceeds to Pre-Auth Review
    const handleP2PSafetyCheckProceed = (check) => {
        setSafetyCheckResult(check);
        setCurrentStep('pre_auth_review');
    };
    // Pre-Auth Review Proceeds to:
    // If amount > 10,000 -> TwoStepVerification
    // If amount <= 10,000 -> DeviceVerification
    const handlePreAuthReviewNext = () => {
        if (paymentAmount > 10000) {
            setCurrentStep('two_step_verification');
        }
        else {
            setCurrentStep('device_verification');
        }
    };
    // Two-Step Verification Complete
    const handleTwoStepSuccess = () => {
        setCurrentStep('device_verification');
    };
    // Device verification complete -> show simulated UPI PIN modal
    const handleDeviceVerificationComplete = () => {
        setShowUpiPinModal(true);
    };
    // Simulated UPI PIN Success -> Transaction Receipt
    const handlePinSuccess = () => {
        setShowUpiPinModal(false);
        const nowStr = new Date().toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
        const randomUtr = `DEMO-UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        let newRecord;
        if (paymentType === 'BILL' && fetchedBill) {
            newRecord = {
                id: `TX-${Date.now()}`,
                date: nowStr,
                type: 'BILL',
                title: `${fetchedBill.billerName} Bill Payment`,
                subtitle: `Consumer No: ${fetchedBill.consumerNumber}`,
                amount: fetchedBill.billAmount,
                billerOrRecipient: fetchedBill.billerName,
                accountReference: `Consumer No: ${fetchedBill.consumerNumber} (${fetchedBill.customerName})`,
                status: 'COMPLETED',
                utrNumber: randomUtr,
                paymentMethod: 'Demo HDFC Bank •••• 4092',
                verificationTag: 'BBPS Verified',
                twoFactorVerified: paymentAmount > 10000,
            };
        }
        else if (paymentType === 'MERCHANT') {
            newRecord = {
                id: `TX-${Date.now()}`,
                date: nowStr,
                type: 'MERCHANT',
                title: `Merchant Payment to ${p2pRecipient?.resolvedName}`,
                subtitle: p2pRecipient?.upiId || '',
                amount: paymentAmount,
                billerOrRecipient: p2pRecipient?.resolvedName || 'MERCHANT STORE',
                accountReference: p2pRecipient?.upiId || 'merchant@upi',
                status: 'COMPLETED',
                utrNumber: randomUtr,
                paymentMethod: 'Demo HDFC Bank •••• 4092',
                verificationTag: p2pRecipient?.merchantVerification?.isVerifiedMerchant
                    ? 'Demo merchant-directory match'
                    : 'No match in demo directory',
                twoFactorVerified: paymentAmount > 10000,
            };
        }
        else {
            newRecord = {
                id: `TX-${Date.now()}`,
                date: nowStr,
                type: 'P2P',
                title: `Transfer to ${p2pRecipient?.resolvedName}`,
                subtitle: p2pRecipient?.upiId || '',
                amount: paymentAmount,
                billerOrRecipient: p2pRecipient?.resolvedName || 'DEMO RECIPIENT',
                accountReference: p2pRecipient?.upiId || 'demo@okhdfcbank',
                status: 'COMPLETED',
                utrNumber: randomUtr,
                paymentMethod: 'Demo HDFC Bank •••• 4092',
                verificationTag: p2pRecipient?.friendVerification?.isVerifiedUser
                    ? 'Demo profile match'
                    : 'Account Name Matched',
                warningNote: p2pRecipient?.friendVerification?.isVerifiedUser
                    ? 'Demo transfer to a sample contact.'
                    : 'Simulated account-name match; no bank lookup occurred.',
                twoFactorVerified: paymentAmount > 10000,
            };
        }
        setTransactions((prev) => [newRecord, ...prev]);
        setReceiptData(newRecord);
        setCurrentStep('receipt');
    };
    const handleReturnHome = () => {
        setCurrentStep('home');
        setSelectedBiller(null);
        setFetchedBill(null);
        setP2pRecipient(null);
        setSafetyCheckResult(null);
        setActiveQueryText('');
        setPaymentAmount(500);
    };
    return (<div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none antialiased">
      {/* Top Prototype Alert Bar */}
      <PrototypeBanner />

      {/* Top Floating Control Bar for Prototype Evaluator */}
      <header className="px-4 py-2.5 bg-slate-900 border-b border-slate-700 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-sky-400 ring-4 ring-sky-500/20 animate-pulse"></div>
          <span className="font-extrabold text-white tracking-tight text-sm">AuraPay AI</span>
          <span className="text-xs text-sky-300 hidden sm:inline font-medium">
            • Trustworthy Bill-Payment & P2P Assistant
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Action Pills in Header */}
          <button onClick={() => {
            sound.playTap();
            setCurrentStep('friend_select');
        }} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-500 transition cursor-pointer text-xs font-semibold hidden md:flex items-center gap-1">
            <Users className="w-3.5 h-3.5"/>
            <span>Friends</span>
          </button>

          <button onClick={() => {
            sound.playTap();
            setCurrentStep('merchant_select');
        }} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500 transition cursor-pointer text-xs font-semibold hidden md:flex items-center gap-1">
            <Store className="w-3.5 h-3.5"/>
            <span>Merchants</span>
          </button>

          <button onClick={() => {
            sound.playTap();
            setCurrentStep('new_user_input');
        }} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500 transition cursor-pointer text-xs font-semibold hidden md:flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5"/>
            <span>New User</span>
          </button>

          {/* Sound Toggle */}
          <button onClick={toggleSound} title={soundEnabled ? 'Mute audio' : 'Unmute audio'} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer border border-slate-700 shadow-sm">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400"/> : <VolumeX className="w-4 h-4 text-slate-400"/>}
          </button>

          {/* Directory Quick Link */}
          <button onClick={() => setIsDirectoryOpen(true)} className="px-3 py-1.5 rounded-xl bg-sky-950 text-sky-200 border-2 border-sky-600 hover:bg-sky-900 transition cursor-pointer text-xs font-bold hidden xs:flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400"/>
            <span>BBPS Directory</span>
          </button>

          {/* Frame Toggle */}
          <button onClick={() => setIsMobileFrame(!isMobileFrame)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer text-xs font-semibold border border-slate-700 shadow-sm">
            {isMobileFrame ? (<>
                <Monitor className="w-3.5 h-3.5 text-sky-400"/>
                <span className="hidden sm:inline">Expanded View</span>
              </>) : (<>
                <Smartphone className="w-3.5 h-3.5 text-sky-400"/>
                <span className="hidden sm:inline">Mobile Frame</span>
              </>)}
          </button>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        <div className={`w-full flex flex-col bg-slate-900 border-x-2 sm:border-2 border-slate-700 transition-all duration-300 shadow-2xl overflow-hidden ${isMobileFrame
            ? 'max-w-[420px] h-full sm:h-[840px] sm:rounded-[36px] sm:ring-8 sm:ring-slate-800'
            : 'max-w-2xl h-full sm:h-[840px] sm:rounded-3xl'}`}>
          {/* Mobile Status Bar */}
          <PhoneStatusBar onDirectoryClick={() => setIsDirectoryOpen(true)} onHistoryClick={() => setIsHistoryOpen(true)} historyCount={transactions.length}/>

          {/* Assistant Screens */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {currentStep === 'home' && (<HomeScreen onSubmitPrompt={handleUserPrompt} onOpenDirectory={() => setIsDirectoryOpen(true)} onOpenScamGuide={() => setIsScamGuideOpen(true)}/>)}

            {currentStep === 'friend_select' && (<FriendSelectStep onSelectFriend={handleFriendSelected} onCancel={handleReturnHome} defaultAmount={paymentAmount}/>)}

            {currentStep === 'merchant_select' && (<MerchantSelectStep onSelectMerchant={handleMerchantSelected} onCancel={handleReturnHome} defaultAmount={paymentAmount}/>)}

            {currentStep === 'new_user_input' && (<NewUserPayStep onProceedWithNewUser={handleNewUserProceed} onCancel={handleReturnHome} defaultAmount={paymentAmount}/>)}

            {currentStep === 'biller_selection' && (<BillerSelectStep initialCategory={activeCategory} userPromptText={activeQueryText} onSelectBiller={(biller) => {
                setSelectedBiller(biller);
                setCurrentStep('consumer_input');
            }} onCancel={handleReturnHome}/>)}

            {currentStep === 'consumer_input' && selectedBiller && (<ConsumerInputStep biller={selectedBiller} onBillFetched={handleBillFetched} onBack={() => setCurrentStep('biller_selection')}/>)}

            {currentStep === 'bill_review' && fetchedBill && (<BillReviewCard bill={fetchedBill} onProceedToAuth={() => setCurrentStep('pre_auth_review')} onBack={() => setCurrentStep('consumer_input')}/>)}

            {currentStep === 'p2p_safety_check' && p2pRecipient && (<P2PSafetyCheckStep recipient={p2pRecipient} amount={paymentAmount} rawUserPrompt={activeQueryText} onProceedToReview={handleP2PSafetyCheckProceed} onCancelPayment={handleReturnHome}/>)}

            {currentStep === 'pre_auth_review' && (<PreAuthReviewScreen type={paymentType} billDetails={fetchedBill || undefined} p2pRecipient={p2pRecipient || undefined} amount={paymentAmount} safetyCheck={safetyCheckResult || undefined} onProceedToNext={handlePreAuthReviewNext} onBack={() => {
                if (paymentType === 'BILL')
                    setCurrentStep('bill_review');
                else if (p2pRecipient?.isFriendContact)
                    setCurrentStep('friend_select');
                else if (p2pRecipient?.isMerchant)
                    setCurrentStep('merchant_select');
                else
                    setCurrentStep('p2p_safety_check');
            }}/>)}

            {currentStep === 'two_step_verification' && (<TwoStepVerificationStep amount={paymentAmount} recipientOrBiller={paymentType === 'BILL'
                ? (fetchedBill?.billerName || 'Biller')
                : (p2pRecipient?.resolvedName || 'Recipient')} onVerificationSuccess={handleTwoStepSuccess} onCancel={() => setCurrentStep('pre_auth_review')}/>)}

            {currentStep === 'device_verification' && (<DeviceVerificationStep onVerificationComplete={handleDeviceVerificationComplete}/>)}

            {currentStep === 'receipt' && receiptData && (<TransactionReceipt type={receiptData.type} title={receiptData.title} recipientOrBiller={receiptData.billerOrRecipient} accountReference={receiptData.accountReference} amount={receiptData.amount} utrNumber={receiptData.utrNumber} timestamp={receiptData.date} paymentMethod={receiptData.paymentMethod} warningNote={receiptData.warningNote} onReturnHome={handleReturnHome} onViewHistory={() => setIsHistoryOpen(true)}/>)}
          </div>
        </div>
      </main>

      {/* Simulated UPI PIN Step Modal */}
      {showUpiPinModal && (<UpiPinModal amount={paymentAmount} recipientOrBiller={paymentType === 'BILL'
                ? (fetchedBill?.billerName || 'Verified Biller')
                : (p2pRecipient?.resolvedName || 'Recipient')} onPinSuccess={handlePinSuccess} onCancel={() => setShowUpiPinModal(false)}/>)}

      {/* Verified Biller Directory Modal */}
      <BillerDirectoryModal isOpen={isDirectoryOpen} onClose={() => setIsDirectoryOpen(false)} onSelectBillerToPay={(biller) => {
            setIsDirectoryOpen(false);
            setSelectedBiller(biller);
            setActiveCategory(biller.category);
            setPaymentType('BILL');
            setActiveQueryText(`Pay ${biller.shortName} bill`);
            setCurrentStep('consumer_input');
        }}/>

      {/* Safety & Scam Guide Modal */}
      <ScamEducationModal isOpen={isScamGuideOpen} onClose={() => setIsScamGuideOpen(false)}/>

      {/* Simulated Transaction History Drawer */}
      <TransactionHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} transactions={transactions} onSelectReceipt={(tx) => {
            setReceiptData(tx);
            setCurrentStep('receipt');
            setIsHistoryOpen(false);
        }}/>
    </div>);
}
export default App;
