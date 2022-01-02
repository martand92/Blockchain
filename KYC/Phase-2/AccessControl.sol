pragma solidity ^0.5.9;

contract AccessControl {

    address public admin;
    
    // Main constructor of the contract which also assigns admin
	constructor() public {
		admin = msg.sender;
	}

    //Customer 
    struct Customer {
        string userName;   
        string data;
        bool kycStatus;  
        uint8 downVotes; 
        uint8 upVotes; 
        address bank;  
    }
    
    //Bank
    struct Bank {
        string name;
        address ethAddress; 
        uint8 complaintsReported;
        uint8 KYC_Count;  
        bool isAllowedToVote;
        string regNumber;
    }
    
    
    //KYCRequest
    struct KYCRequest {
        string userName; 
        address bank; 
        string data;
    }
    
    
    mapping(string => KYCRequest) requests;
    
    mapping(string => Customer) customers;

    mapping(address => Bank) banks;
    
    //To check if registration number of bank is unique
    mapping (string => bool) regNumIsNotUnique;
    
    //To check if customer data is unique against username 
    mapping (string => mapping (string => bool)) custDataIsNotUnique;
    
    //Modifier to check if registration number of bank is unique
    modifier uniqueRegistrationNum (string memory _regNumber){
         require(regNumIsNotUnique[_regNumber] == false ,"Registration Number is not unique");
        _;
    }
    
    //Modifier to check if customer data is unique against provided username 
    modifier uniqueCustData (string memory _userName, string memory _customerData){
         require(custDataIsNotUnique[_userName][_customerData] == false ,"Customer Data is not unique")  ;
        _;
    }
    
    //Modifier to restrict execution of function to only admin
    modifier onlyAdmin (){
         require(admin == msg.sender, "Only Admin is allowed to perform this operation");
        _;
    }
    
    //Modifier to check if KYC request raised by Bank is still available
    modifier kycRequestUnavailable (string memory _userName){
         require(requests[_userName].bank != address(0) , "KYC Request is unavailable");
        _;
    }
    
    //Modifier to check if Bank is authorized to perform given operation
    modifier unAuthBank (address _bank){
         require(banks[_bank].ethAddress == msg.sender, "This Bank is not authorized to perform this operation");
        _;
    }
    
    //Modifier to check given Bank to neither upvote nor downvote their customer
    modifier noSelfVote (string memory _userName){
         require(customers[_userName].bank != msg.sender, "Bank is not allowed to self vote");
        _;
    }
    
    //Modifier to check if given Bank is either allowed to vote  or do KYC for a customer
    modifier bankKYCCheck(){
        require(banks[msg.sender].isAllowedToVote == true , "This bank is neither allowed to vote nor do KYC");
        _;
    }
    
    //Modifier to check if customer is available in the system / database 
    modifier customerAvailable (string memory _userName){
         require(customers[_userName].bank == address(0), "Customer is already present in Databse");
        _;
    }
    
    //Modifier to check if customer is not available in the system / database 
    modifier customerNotAvailable (string memory _userName){
         require(customers[_userName].bank != address(0), "Customer is not present in Database");
        _;
    }
    
    //Modifier to check if bank is available in the system / database 
    modifier bankAvailable (address _bank){
         require(banks[_bank].ethAddress != _bank, "Bank is already present in Database");
        _;
    }
    
    //Modifier to check if bank requesting for details is in DB and also check if requested Bank is also in DB
    modifier bankNotAvailable (address _bank){
        if(_bank == msg.sender)
         require(banks[_bank].ethAddress == _bank, "Bank initating this operation is not in Database");
         require(banks[_bank].ethAddress == _bank, "Provided bank address is not in Database");
        _;
    }
    

    
}