/**
* <h1> A Decentralized KYC Verification Process for Banks! </h1>
* Banks can utilise the feature set of blockchain to reduce the difficulties faced by the traditional KYC process. 
* A distributed ledger can be set up between all the banks, where one bank can upload the KYC of a customer and other banks can vote on the legitimacy of the customer details. 
* KYC for the customers will be immutably stored on the blockchain and will be accessible to all the banks in the blockchain.
*
* @author  Martand Kulkarni
* @version 1.0
* @since   2021-06-09
*/


pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2; //This supports Struct returnType. This is needed to view Bank details 

import './AccessControl.sol';

contract KYC is AccessControl{
    
    //totalBanks gives total number of banks available in the system
    uint8 public totalBanks = 0;
    
  
    /**
    * addKYCRequest enables Bank already in system (added by Admin) to add KYC of a customer. Once Bank existing in this blockchain picks CustomerData and validates, 
    * data is added to requests list and then added to customers list. Single user can raise multiple KYC requests
    * @param        _userName           Username of the customer to be added to requests list
    * @param        _customerData       Hash of the customerDoc to be added to requests list
    * @return       Nothing.
    * Modifiers     uniqueCustData      Customer data is ensured to be unique
    *               bankNotAvailable    Banks already Onbaorded onto Blockchain are only allowed to add KYC 
    *               bankKYCCheck        Check if Bank is Allowed To Vote or do KYC
    *               customerAvailable   Check if Customer already exists    
    */
    function addKYCRequest (string memory _userName, string memory _customerData) public uniqueCustData(_userName, _customerData) bankNotAvailable(msg.sender) bankKYCCheck customerAvailable(_userName) {
        requests[_userName].userName = _userName;
        requests[_userName].bank = msg.sender;
        requests[_userName].data = _customerData;
        custDataIsNotUnique[_userName][_customerData] = true;
        addCustomer(requests[_userName].userName, requests[_userName].data);
    }
    
    
    /**
    * removeKYCRequest enables Bank to remove KYC request from requestsList. Bank that had initially raise KYC request is only allowed to remove KYC, 
    * @param        _userName               Username of the customer for which KYC request need to be removed
    * @return       Nothing.
    * Modifiers     unAuthBank              Bank that has initially added KYC request is only allowed to remove respective KYC 
    *               kycRequestUnavailable   Check if request exists before removing
    */
    function removeKYCRequest (string memory _userName) public unAuthBank(msg.sender) kycRequestUnavailable(_userName) {
       delete requests[_userName];
    }    
    
    
    /**
    * addCustomer enables Bank that generated KYC Request to add customer in this request to customerList in blockchain. This service is private and will be called by 
    * addKYCRequest() if all checks are successful. 
    * @param        _userName       Username of the customer to be added into customers list
    * @param        _customerData   Hash of the customerDoc to be added to customers list
    * @return       Nothing.
    */    
    function addCustomer(string memory _userName, string memory _customerData) private {
        customers[_userName].userName = _userName;
        customers[_userName].data = _customerData;
        customers[_userName].kycStatus = true;
        customers[_userName].downVotes = 0;
        customers[_userName].upVotes = 0;
        customers[_userName].bank = msg.sender;  
        banks[msg.sender].KYC_Count = banks[msg.sender].KYC_Count + 1;
        delete requests[_userName];
    }
    
    
    /**
    * modifyCustomer enables Bank to modify customer details in customerList in blockchain. Bank that added data to customer's list can only modify
    * @param        _userName               Username of the customer available in blockchain
    * @param        _newCustomerData        Hash of the customerDoc to be added to customers list
    * @return       Nothing.
    * Modifiers     unAuthBank              Bank that has initially added customer is only allowed to modify
    *               customerNotAvailable    Check for customer availability before modifying
    *               uniqueCustData          New Customer Data must be unique 
    */     
    function modifyCustomer(string memory _userName, string memory _newCustomerData) public unAuthBank(msg.sender) customerNotAvailable(_userName) uniqueCustData(_userName, _newCustomerData) {
        delete requests[_userName];
        customers[_userName].upVotes = 0;
        customers[_userName].downVotes = 0;
        custDataIsNotUnique[_userName][customers[_userName].data] = false;
        customers[_userName].data = _newCustomerData;
        custDataIsNotUnique[_userName][_newCustomerData] = true;
    }    
    
    
    /**
    * viewCustomer enables any Banks to view customer details available in blockchain.
    * @param        _userName               Username of the customer available in blockchain
    * @return       customers               Complete details of the customer
    * Modifiers     bankNotAvailable        Cheking if Bank requesting for customer details is already in system
    *               customerNotAvailable    Check for customer availability
    */     
    function viewCustomer(string memory _userName) public view bankNotAvailable(msg.sender) customerNotAvailable(_userName) returns (string memory , string memory, bool, uint8, uint8, address) {
        return (customers[_userName].userName, customers[_userName].data, customers[_userName].kycStatus, customers[_userName].downVotes, customers[_userName].upVotes, customers[_userName].bank);
    }    
    
    
    /**
    * upVote enables any Banks in the system except the bank that onboarded this customer to up vote customer available in blockchain. Once upvote is done, 
    * this customer's kyc status is recalculated based on updated upvote and downvote state using function: checkKYCStatus
    * @param        _userName               Username of the customer available in blockchain
    * @return       Nothing
    * Modifiers     bankNotAvailable        Check if this bank is part of system
    *               noSelfVote              Bank that initially onboarded customer by KYC is not allowed to self vote, 
    *               customerNotAvailable    Check for customer availability before voting
    *               bankKYCCheck            Bank that's about to vote is checked whether its allowed to vote 
    */      
    function upVote (string memory _userName) public bankNotAvailable(msg.sender) noSelfVote(_userName) customerNotAvailable(_userName) bankKYCCheck {
        customers[_userName].upVotes = customers[_userName].upVotes + 1;
        customers[_userName].kycStatus = checkKYCStatus(customers[_userName].upVotes , customers[_userName].downVotes);
    }  
    
    
    /**
    * downVote enables any Banks except the bank that onboarded this customer to down vote customer available in blockchain. Once downvote is done, 
    * this customer's kyc status is recalculated based on updated upvote and downvote state using checkKYCStatus()
    * @param        _userName              Username of the customer available in blockchain
    * @return       Nothing
    * Modifiers     bankNotAvailable      Check if this bank is part of system 
    *               noSelfVote            Bank that initially onboarded customer by KYC is not allowed to self vote, 
    *               customerNotAvailable  Check for customer availability before voting
    *               bankKYCCheck          Bank that's about to vote is checked whether its allowed to vote 
    */      
    function downVote (string memory _userName) public bankNotAvailable(msg.sender) noSelfVote(_userName) customerNotAvailable(_userName) bankKYCCheck {
        customers[_userName].downVotes = customers[_userName].downVotes + 1;
        customers[_userName].kycStatus = checkKYCStatus(customers[_userName].upVotes , customers[_userName].downVotes);
    } 
    
    
    /**
    * checkKYCStatus, a private function equates customer's kycStatus as true or false based on updated upvote & downvote values received as part of upvote(), downVote().
    * Logic is wriiten to make customer's kycStatus as true if downVote of this customer < (1/3) of total available Banks and if upVotes > downVotes. 
    * This ensures if downVote > (1/3) of total Banks, then kycStatus of this customer is false irrespective of upVote > downVote
    * 
    * @param        upVotes                Up votes received for customer available in blockchain
    * @param        downVotes              Down Votes received for customer available in blockchain
    * @return       kycStatus              KYC Status of this customer back to upVote() / downVote()
    * Modifiers     noSelfVote             Bank that initially onboarded customer by KYC is not allowed to self vote
    *               customerNotAvailable   Check for customer availability before voting
    *               bankKYCCheck           Bank that's about to vote is checked whether its allowed to vote 
    */ 
    function checkKYCStatus (uint8 upVotes ,uint8 downVotes) private view returns(bool) {
        bool kycStatus;
        if(downVotes < (totalBanks / 3)){
            if(upVotes > downVotes)
                kycStatus = true;
            else kycStatus = false;
        }
        else kycStatus = false;
        
        return kycStatus;
    }
    
    
    /**
    * getBankComplaints enables any Banks in system to get complaints of any other banks in the system
    * @param        _bank                Bank address whose reported complaints  need to be fetched 
    * @return       complaintsReported   Reported complaints of the bank in interest is returned
    * Modifiers     bankNotAvailable     Check if bank requesting for details and requested bank's details are part of the system
    */  
    function getBankComplaints(address _bank) public view bankNotAvailable(msg.sender) bankNotAvailable(_bank) returns (uint8) {
        return (banks[_bank].complaintsReported);
    }    
    
    
   /**
    * viewBankDetails enables any Banks in system to view other bank's details
    * @param        _bank                Bank address whose reported complaints  need to be fetched 
    * @return       Bank                 Bank's details are returned
    * Modifiers     bankNotAvailable     Check if bank requesting for details and requested for details are part of the system
    */     
    function viewBankDetails(address _bank) public view bankNotAvailable(msg.sender) bankNotAvailable(_bank) returns (Bank memory) {
        return (banks[_bank]);
    } 
    
    
   /**
    * reportBank enables any Banks in system to report any other bank in the system. Bank's complaintsReported field is increased by 1 and its checked if
    * updated complaintsReported of this bank is greater than (1/3) of total available Banks, if true than this bank is not allowed to vote anymore
    * @param        _bank                Bank address which is to be reported 
    * @return       Nothing   
    * Modifiers     bankNotAvailable     Check if bank about to report and to be reported are part of the system
    */  
    function reportBank(address _bank) public bankNotAvailable(msg.sender) bankNotAvailable(_bank) {
        banks[_bank].complaintsReported = banks[_bank].complaintsReported + 1; 
        if(banks[_bank].complaintsReported > (totalBanks / 3))
            banks[_bank].isAllowedToVote = false;
    }
    
    
    
    
    /**
    * addBank enables Admin to add Banks into system.
    * @param        _name                   Bank name
    * @param        _bank                   Address of the Bank
    * @param        _regNumber              Bank's registration number
    * @return       Nothing   
    * Modifiers     onlyAdmin               Only Admin has access to call this function
    *               bankAvailable           Before adding bank, check if this bank already exists in the system
    *               uniqueRegistrationNum   Registration number of bank being onboarded must be unique against all available banks in system
    */    
    function addBank (string memory _name, address _bank, string memory _regNumber) public onlyAdmin bankAvailable(_bank) uniqueRegistrationNum(_regNumber){
        banks[_bank].name = _name;
        banks[_bank].ethAddress = _bank;
        banks[_bank].complaintsReported = 0;
        banks[_bank].KYC_Count = 0;
        banks[_bank].isAllowedToVote = true;
        banks[_bank].regNumber = _regNumber;
        regNumIsNotUnique[_regNumber] = true;
        ++totalBanks;
    }


    /**
    * modifyBankIsAllowedToVote enables Admin to disable Banks from further voting or participating in KYC of customer.
    * @param        _bank                   Address of the Bank
    * @param        _isAllowedToVote        true of false, based on this bank should be allowed or banned from further voting or KYC process
    * @return       Nothing   
    * Modifiers     onlyAdmin               Only Admin has access to call this function
    *               bankNotAvailable        Check if this bank is part of the system
    */      
    function modifyBankIsAllowedToVote (address _bank, bool _isAllowedToVote) public onlyAdmin bankNotAvailable(_bank) {
        banks[_bank].isAllowedToVote = _isAllowedToVote;
    }
    
    
    /**
    * removeBank enables Admin to remove Banks from from system.
    * @param        _bank                   Address of the Bank
    * @return       Nothing   
    * Modifiers     onlyAdmin               Only Admin has access to call this function
    *               bankNotAvailable        Check if this bank is part of the system
    */ 
    function removeBank (address _bank) public onlyAdmin bankNotAvailable(_bank){
        regNumIsNotUnique[banks[_bank].regNumber] = false;
        delete banks[_bank];
        --totalBanks;
    }
    
}    


