import * as React from 'react';
import { connect } from "react-redux";
import { IPublicSiteStoreState } from "../../../redux/public_site_reducer";
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ModalWrapper } from '../../ModalWrapper';
import DynamicForm from '../../formTemplates/DynamicForm';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { toast } from 'react-toastify';
import { FlagIcon, fixCountryCode } from '../../FlagIcon';
import * as iso3311a2 from 'iso-3166-1-alpha-2';
import { formatJSONDateTime } from '../../../utils/formatters';
import { renderIf, renderSwitch, renderIfTrue } from '../../../utils/react_utils';
import { Table } from '../../shared/Table';

var merge = require('merge');
var JSONPretty = require('react-json-pretty');
const projectBG = require('../../../assets/images/project-bg.jpg');

export namespace SingleProject {

    export interface Props {
        location?: any,
        ixo?: any,
    }
    export interface State {
        projectMeta: any,
        isModalOpen: boolean,
        agentFormSchema: any,
        claimFormSchema: any,
        evaluationFormSchema: any,
        agentList: any,
        claimList: any,
        selectedStatus: string,
        modalType: string,
        currentClaimJson: any
    }

    export interface IProps extends Props {
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export class SingleProject extends React.Component<SingleProject.IProps, SingleProject.State> {

    constructor(props?: SingleProject.IProps, context?: any) {
        super(props, context);
        this.state = {
            isModalOpen: false,
            projectMeta: this.props.location.state,
            agentFormSchema: {},
            claimFormSchema: {},
            evaluationFormSchema: {},
            agentList: [],
            claimList: [],
            currentClaimJson: null,
            selectedStatus: 'Approved',
            modalType: null
        }
    }

    componentDidMount() {

        console.log(this.state.projectMeta);
        this.props.ixo.agent.getAgentTemplate('default').then((response: any) => {
            if (response.result.form.fields !== this.state.agentFormSchema) {
                this.setState({ agentFormSchema: response.result.form.fields });
            }
        }).catch((error: Error) => {
            console.log(error);
        });

        this.props.ixo.claim.getClaimTemplate('default').then((response: any) => {
            if (response.result.form.fields !== this.state.claimFormSchema) {
                this.setState({ claimFormSchema: response.result.form.fields });
            }
        }).catch((error: Error) => {
            console.log(error);
        });

        this.props.ixo.claim.getEvaluationTemplate('default').then((response: any) => {
            if (response.result.form.fields !== this.state.evaluationFormSchema) {
                this.setState({ evaluationFormSchema: response.result.form.fields });
            }
        }).catch((error: Error) => {
            console.log(error);
        });


        this.getClaimList();
        this.getAgentList();
    }

    getAgentList() {
        this.props.ixo.agent.listAgentsForProject(this.props.ixo.credentialProvider.getDid(), this.state.projectMeta.tx).then(agentList => {
            this.setState({ agentList: agentList.result })
        }).catch(error => {
            console.log(error);
        })
    }

    getClaimList() {
        this.props.ixo.claim.listClaimsByProjectId(this.state.projectMeta.tx).then(claimList => {
            this.setState({ claimList: claimList.result });
        }).catch(error => {
            console.log(error);
        })
    }

    handleClaimEvaluation = (formData: any) => {
        var toastId = toast('Evaluating claim...', { autoClose: false });
        var data = { claimTx: formData.claimTx, result: formData.result };
        this.props.ixo.claim.evaluateClaim(data, 'default').then((response: any) => {
            if (response.result) {
                this.handleToggleModal(false);
                toast.update(toastId, {
                    render: 'Claim evaluated',
                    type: 'success',
                    autoClose: 3000
                });
                this.getClaimList();
            } else if (response.error) {
                this.handleToggleModal(false);
                toast.update(toastId, {
                    render: response.error.message,
                    type: 'error',
                    autoClose: 3000
                });
            }
        }).catch((error) => {
            this.handleToggleModal(false);
            toast.update(toastId, {
                render: 'Error submitting claim',
                type: 'error',
                autoClose: 3000
            });;
        })
    }

    handleClaimSubmit = (formData: any) => {
        var toastId = toast('Submitting claim...', { autoClose: false });
        var data = merge(formData, { projectTx: this.state.projectMeta.tx })
        this.props.ixo.claim.createClaim(formData, 'default').then((response: any) => {
            if (response.result) {
                this.handleToggleModal(false);
                toast.update(toastId, {
                    render: 'Claim submitted',
                    type: 'success',
                    autoClose: 3000
                });
                this.getClaimList();
            } else if (response.error) {
                this.handleToggleModal(false);
                toast.update(toastId, {
                    render: response.error.message,
                    type: 'error',
                    autoClose: 3000
                });
            }
        }).catch((error) => {
            this.handleToggleModal(false);
            toast.update(toastId, {
                render: 'Error submitting claim',
                type: 'error',
                autoClose: 3000
            });;
        })
    }

    handleAgentSubmit = (formData: any) => {
        var toastId = toast('Creating agent...', { autoClose: false });
        var data = merge(formData, { projectTx: this.state.projectMeta.tx })
        this.props.ixo.agent.createAgent(formData, 'default').then((response: any) => {
            if (response.result) {
                this.handleToggleModal(false);
                toast.update(toastId, {
                    render: 'Agent Created',
                    type: 'success',
                    autoClose: 3000
                });
                this.getAgentList();
            } else if (response.error) {
                this.handleToggleModal(false);
                toast.update(toastId, {
                    render: response.error.message,
                    type: 'error',
                    autoClose: 3000
                });
            }
        }).catch((error) => {
            this.handleToggleModal(false);
            toast.update(toastId, {
                render: 'Error creating agent',
                type: 'error',
                autoClose: 3000
            });;
        })
    }

    handleRegisterAgent = () => {
        this.setState({ modalType: 'agent' });
        this.handleToggleModal(true);
    }

    handleCaptureClaim = () => {
        this.setState({ modalType: 'claim' });
        this.handleToggleModal(true);
    }

    handleEvaluateClaim = (claimData: string) => {
        this.setState({ modalType: 'evaluate' });
        this.handleToggleModal(true);
    }

    handleToggleModal(modalStatus) {
        this.setState({ isModalOpen: modalStatus });
    };

    handleRenderEvaluateForm = () => {
        if (this.state.agentFormSchema.length > 0) {
            let agentSchema = [...this.state.evaluationFormSchema];
            agentSchema = agentSchema.filter((value) => value.name !== "template.name" && value.name !== "projectTx")
            return <DynamicForm formSchema={agentSchema} handleSubmit={this.handleClaimEvaluation} />
        } else {
            return <p>Loading Form...</p>
        }
    }

    handleRenderAgentForm = () => {
        if (this.state.agentFormSchema.length > 0) {
            let agentSchema = [...this.state.agentFormSchema];
            agentSchema = agentSchema.filter((value) => value.name !== "template.name" && value.name !== "projectTx")
            return <DynamicForm formSchema={agentSchema} handleSubmit={this.handleAgentSubmit} />
        } else {
            return <p>Loading Form...</p>
        }
    }

    handleRenderClaimForm = () => {
        if (this.state.claimFormSchema.length > 0) {
            let agentSchema = [...this.state.claimFormSchema];
            agentSchema = agentSchema.filter((value) => value.name !== "template.name" && value.name !== "projectTx")
            return <DynamicForm formSchema={agentSchema} handleSubmit={this.handleClaimSubmit} />
        } else {
            return <p>Loading Form...</p>
        }
    }

    handleRenderClaimJson = () => {
        return <div><JSONPretty id="json-pretty" json={this.state.currentClaimJson}></JSONPretty></div>;
    }

    createCustomClearButton = (onClick) => {
        return (
            <ClearButton onClick={onClick}>Clear</ClearButton>
        );
    }

    onUpdateStatus = (row, selectedOption) => {
        var agentData = {
            agentTx: row.tx,
            status: selectedOption
        }
        var toastId = toast('Updating agent status...', { autoClose: false });

        this.props.ixo.agent.updateAgentStatus(agentData).then((response: any) => {
            if (response.error) {
                toast.update(toastId, {
                    render: response.error.message,
                    type: 'error',
                    autoClose: 3000
                })
            }
            if (response.result.latestStatus === selectedOption) {
                toast.update(toastId, {
                    render: 'Agent status updated',
                    type: 'success',
                    autoClose: 3000
                })
                this.getAgentList();
            }
        });
    }

    onSetStatus = (selectedStatus) => {
        this.setState({ selectedStatus: selectedStatus.target.value });
    }

    getCountryName(countryCode: string): string {
        return iso3311a2.getCountry(fixCountryCode(countryCode).toUpperCase())
    }

    onViewClaimClicked = (row) => {
        this.handleToggleModal(true);
        this.setState({ currentClaimJson: row, modalType: 'json' })
    }

    renderTable(type: string) {
        const options = {
            clearSearch: true,
            clearSearchBtn: this.createCustomClearButton
        };
        var selectOptions = [
            { label: 'Approve', value: 'Approved' },
            { label: 'Decline', value: 'NotApproved' },
            { label: 'Revoke', value: 'Revoked' }
        ];

        switch (type) {
            case 'agents': {
                const agentsButtons = [
                    {
                        headerLabel: 'Update Status',
                        buttonLabel: 'Update',
                        callback: this.onUpdateStatus
                    }
                ]

                return <Table tableList={this.state.agentList}
                    tableOptions={options}
                    customButtons={agentsButtons}
                    selectOptions={selectOptions} />
            }
            case 'claims': {
                const claimsButtons = [
                    {
                        headerLabel: 'jsonData',
                        buttonLabel: 'View Claim Data',
                        callback: this.onViewClaimClicked
                    },
                    {
                        headerLabel: 'Evaluate',
                        buttonLabel: 'Evaluate',
                        callback: this.handleEvaluateClaim
                    }
                ]

                return <Table tableList={this.state.claimList}
                    tableOptions={options}
                    customButtons={claimsButtons}
                />
            }
        }
    }

    claimStatistics() {

        let approved = 0, rejected = 0, pending = 0, approvedPercent = 0, rejectedPercent = 0, pendingPercent = 0;
        const total = this.state.claimList.length;

        this.state.claimList.map((claim,index) => {
            switch(claim.latestEvaluation){
                case "Approved" :
                    approved++;
                    break;
                case "NotApproved":
                    rejected++;
                    break;
                case "Pending":
                    pending++;
                    break;
                default :
                    break;
            }
        });
        
        approvedPercent = (approved/total)*100;
        rejectedPercent = (rejected/total)*100;
        pendingPercent = (pending/total)*100;
        return (
            <ClaimStatistics>
                <ApprovedClaims title={`Approved claims: ${approved}, Percentage of total: ${approvedPercent}%`} style={{width:`${approvedPercent}%`}}></ApprovedClaims>
                <RejectedClaims title={`Rejected claims: ${rejected}, Rejected of total: ${rejectedPercent}%`} style={{width:`${rejectedPercent}%`}}></RejectedClaims>
                <PendingClaims title={`Pending claims: ${pending}, Pending of total: ${pendingPercent}%`} style={{width:`${pendingPercent}%`}}></PendingClaims>
            </ClaimStatistics>
        );
    }

    render() {
        return (
            <div className="container">
                <ProjectContainer>
                    <div className="row">
                        <div className="col-md-12">
                            <ProjectHeader>
                                <Link to="/">&larr; Back to Home</Link>
                                <h1>{this.state.projectMeta.name}</h1>
                                <FlagBox title={this.getCountryName(this.state.projectMeta.country)}>
                                    <FlagIcon code={fixCountryCode(this.state.projectMeta.country)} size='3x'></FlagIcon>
                                </FlagBox>
                            </ProjectHeader>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <ProjectCard>
                                <H2>Project Description</H2>
                                <p>{this.state.projectMeta.about}</p>
                            </ProjectCard>
                        </div>
                        <div className="col-md-6">
                            <ProjectCard>
                                <H2>Additional Project Information</H2>
                                    <p><strong>Created:</strong> {formatJSONDateTime(this.state.projectMeta.created)}</p>
                                    <p><strong>Owner Name:</strong> {this.state.projectMeta.owner.name}</p>
                                    <p><strong>Owner Email:</strong> {this.state.projectMeta.owner.email}</p>
                            </ProjectCard>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <ProjectCard>
                            <div className="row">
                                <div className="col-md-4">
                                    <H2>Project Statistics:</H2>
                                    <p>Claim breakdown</p>
                                    {this.claimStatistics()}
                                </div>
                                <div className="col-md-2 vertical-center">
                                    <p>Successful Claims</p>
                                    <Number>6/10</Number>
                                </div>
                                <div className="col-md-2 vertical-center">
                                    <p>Evaluation Agents</p>
                                    <Number>3</Number>
                                </div>
                                <div className="col-md-2 vertical-center">
                                    <p>Service Agents</p>
                                    <Number>1</Number>
                                </div>
                                <div className="col-md-2 vertical-center">
                                    <p>Investor Agents</p>
                                    <Number>2</Number>
                                </div>
                            </div>
                            </ProjectCard>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <H2>Agents:</H2>
                        <ButtonContainer>
                            <ProjectAnimatedButton onClick={this.handleRegisterAgent}><span>Register as Agent</span></ProjectAnimatedButton>
                        </ButtonContainer>
                        {renderIfTrue(this.state.agentList.length > 0, () => this.renderTable('agents'))}
                    </div>
                    <div className="col-md-12">
                        <H2>Claims:</H2>
                        <ButtonContainer>
                            <ProjectAnimatedButton onClick={this.handleCaptureClaim}><span>Capture Claim</span></ProjectAnimatedButton>
                        </ButtonContainer>
                        {renderIfTrue(this.state.claimList.length > 0, () => this.renderTable('claims'))}
                    </div>
                </ProjectContainer>

                <ModalWrapper
                    isModalOpen={this.state.isModalOpen}
                    handleToggleModal={(modalStatus) => this.handleToggleModal(modalStatus)}>

                    {renderSwitch(this.state.modalType, {
                        agent: () => <div>{this.handleRenderAgentForm()}</div>,
                        claim: () => <div>{this.handleRenderClaimForm()}</div>,
                        json: () => <div>{this.handleRenderClaimJson()}</div>,
                        evaluate: () => <div>{this.handleRenderEvaluateForm()}</div>
                    })}
                </ModalWrapper>
            </div>
        );
    }
}

function mapStateToProps(state: IPublicSiteStoreState) {
    return {
        ixo: state.ixoStore.ixo,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

const ProjectContainer = styled.div`
    margin:30px 0 60px;

    > .row {
        margin-bottom:30px;
    }
`;

const H2 = styled.h2`
    font-size: 28px;
    margin-top: 15px;
`;

const ProjectCard = styled.div`
    background: white;
    box-shadow: 0px 0px 30px 0px rgba(0,0,0,0.1);
    padding: 10px 20px 30px;
    height:100%;
    border-radius:20px;
    border-bottom:5px solid #b6f2ff;

    a {
        color: ${props => props.theme.bgLightest};
        padding:10px;
        display:inline-block;
    }

    ${H2} {
        margin-bottom: 20px;
        color: #00d2ff;
    }

    p {
        margin-bottom:0;
    }

    .vertical-center {
        justify-content:center;
        align-items:center;
        display:flex;
    }
`;

const ProjectHeader = ProjectCard.extend`

    display:flex;
    justify-content:space-between;
    align-items:center;
    padding-bottom:10px;

    h1,a {
        flex:1;
    }

    h1 {
        text-align:center;
        margin-bottom:0;
        font-size:30px;
        color: #00d2ff;
    }

    a:hover {
        text-decoration:none;

    }
`;

const FlagBox = styled.div`
    padding: 5px;
    flex:1;
    text-align:right;
`;
const OwnerBox = styled.div`

    margin-bottom:10px;

    & p {
        margin-bottom:0;
    }
`;

const Number = styled.p`
    font-size:40px;
    font-weight:bold;
    text-align:center;
`

const ClearButton = styled.button`
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    height: 35px;
    background-color: ${props => props.theme.bgLightest};
    border: none;
    color: #FFFFFF;
`;

const ClaimStatistics = styled.div`
    display:flex;
    width:80%;
    margin:0 auto;
`;


const ApprovedClaims = styled.div`
    height:20px;
    background:lime;

`;

const RejectedClaims = styled.div`
    height:20px;
    background:red;
`;

const PendingClaims = styled.div`
    height:20px;
    background:orange;    
`;

const CellButton = styled.button`
    display: block;
    justify-content: center;
    border-radius: 4px;
    height: 35px;
    width: 90px;
    background-color: black;
    border: none;
    color: ${props => props.theme.bgLightest};
`;

const SelectStatus = styled.select`
    display: block;
    justify-content: center;
    background-color: white;
    height: 35px;
    width: 90px;
    border: none;
    color: black;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content:flex-end;
`;

const ProjectAnimatedButton = styled.button`
    border-radius: 4px;
    background-color: ${props => props.theme.bgLightest};
    border: none;
    color: #FFFFFF;
    font-size: 1em;
    transition: all 0.5s;
    cursor: pointer;
    margin-bottom: 5px;
    display: flex;
    align-items: left;
    width: 180px;
    justify-content: space-around;
    height: 35px;
  
  & span {
    cursor: pointer;
    display: inline-block;
    position: relative;
    transition: 0.5s;
  }
  
  & span:after {
    content: '\00bb';
    position: absolute;
    opacity: 0;
    top: 0;
    right: -20px;
    transition: 0.5s;
  }
  
  &:hover span {
    padding-right: 25px;
  }
  
  &:hover span:after {
    opacity: 1;
    right: 0;
  }
`;

const SubmitStatus = styled.p`
    color:#0f8dab;
    margin-top:10px;
    text-align:center;
`;  