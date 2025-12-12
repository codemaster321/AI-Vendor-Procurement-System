import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  DollarSign,
  Clock,
  FileText,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Wifi,
  Search,
  FileCheck,
  XCircle,
} from "lucide-react";
import {
  getRFPById,
  getProposalsByRFP,
  compareProposals,
  createProposal,
} from "../services/api";
import { useEmailFetchSSE } from "../hooks/useEmailFetchSSE";

const ProposalComparison = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualProposal, setManualProposal] = useState({
    vendorId: "",
    rawEmail: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // SSE hook for email fetching
  const {
    isLoading: fetchingEmails,
    progress: emailProgress,
    error: emailError,
    fetchEmails: fetchEmailsSSE,
    cancel: cancelFetch,
    reset: resetFetch,
  } = useEmailFetchSSE();

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      4000
    );
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rfpRes, proposalsRes] = await Promise.all([
        getRFPById(id),
        getProposalsByRFP(id),
      ]);
      setRfp(rfpRes.data);
      setProposals(proposalsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (proposals.length === 0) {
      alert("No proposals to compare");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await compareProposals(id);
      setComparison(response.data);
      showNotification("success", "AI analysis complete!");
    } catch (error) {
      console.error("Error comparing proposals:", error);
      showNotification("error", "Failed to compare proposals");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFetchEmails = async () => {
    try {
      const result = await fetchEmailsSSE(id, {
        onComplete: (data) => {
          const count = data?.newProposals || 0;
          showNotification(
            "success",
            count > 0 ? `Found ${count} new proposal(s)!` : "No new proposals found"
          );
          fetchData();
        },
        onError: (errorMessage) => {
          showNotification(
            "error",
            errorMessage || "Failed to fetch emails. Check email configuration."
          );
        }
      });
    } catch (error) {
      console.error("Error fetching emails:", error);
      // Error handling is done in onError callback
    }
  };

  // Helper function to get the appropriate icon for each stage
  const getStageIcon = (stage) => {
    switch (stage) {
      case 'connecting':
      case 'initializing':
        return <Wifi className="text-blue-400" size={18} />;
      case 'searching':
        return <Search className="text-cyan-400" size={18} />;
      case 'parsing':
      case 'processing':
        return <FileCheck className="text-purple-400" size={18} />;
      case 'complete':
        return <CheckCircle2 className="text-green-400" size={18} />;
      case 'error':
        return <XCircle className="text-red-400" size={18} />;
      default:
        return <Mail className="text-blue-400" size={18} />;
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProposal({
        rfpId: id,
        vendorId: manualProposal.vendorId,
        rawEmail: manualProposal.rawEmail,
      });
      setShowManualForm(false);
      setManualProposal({ vendorId: "", rawEmail: "" });
      showNotification("success", "Proposal added successfully!");
      fetchData();
    } catch (error) {
      console.error("Error creating proposal:", error);
      showNotification("error", "Failed to create proposal");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-400" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-500 animate-slide-up max-w-sm`}>
          <div
            className={`flex items-center space-x-3 px-5 py-4 rounded-xl shadow-2xl border ${notification.type === "success"
              ? "bg-green-900/90 border-green-500/50 text-green-100"
              : "bg-red-900/90 border-red-500/50 text-red-100"
              }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2
                className="text-green-400 flex-shrink-0"
                size={22}
              />
            ) : (
              <AlertCircle className="text-red-400 flex-shrink-0" size={22} />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() =>
                setNotification({ show: false, type: "", message: "" })
              }
              className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Email Fetching Background Toast - Non-blocking */}
      {fetchingEmails && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900/90 rounded-xl p-4 border border-blue-500/30 shadow-2xl w-80 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
                  <Mail className="absolute inset-0 m-auto text-blue-400" size={12} />
                </div>
                <span className="text-sm font-semibold text-white">Fetching Emails</span>
              </div>
              <button
                onClick={() => {
                  cancelFetch();
                  showNotification("info", "Email fetch cancelled");
                }}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <XCircle size={16} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center space-x-1">
                  {getStageIcon(emailProgress.stage)}
                  <span className="capitalize ml-1">{emailProgress.stage || "Starting"}</span>
                </span>
                <span>{emailProgress.percentage || 0}%</span>
              </div>
              <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${emailProgress.percentage || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Status Message */}
            <p className="text-xs text-gray-400 truncate">
              {emailProgress.message || "Initializing..."}
            </p>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900/80 rounded-2xl p-8 border border-purple-500/30 shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
                <div
                  className="absolute inset-2 rounded-full border-4 border-pink-400/30 border-b-transparent animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
                <Sparkles
                  className="absolute inset-0 m-auto text-purple-400"
                  size={28}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                AI Analyzing Proposals
              </h3>
              <p className="text-gray-400 mb-4">
                Evaluating vendors and generating recommendations...
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-3">
                  <CheckCircle2 className="text-green-400" size={18} />
                  <span className="text-sm text-gray-300">
                    Comparing {proposals.length} proposals
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-3">
                  <TrendingUp className="text-purple-400" size={18} />
                  <span className="text-sm text-gray-300">
                    Scoring price, delivery & terms...
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-3">
                  <Sparkles className="text-pink-400 animate-pulse" size={18} />
                  <span className="text-sm text-gray-300">
                    Generating AI recommendation...
                  </span>
                </div>
              </div>
              <div className="mt-6 h-2 bg-purple-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{rfp?.title}</h1>
          <p className="text-gray-400 mt-1">Proposal Comparison & Analysis</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleFetchEmails}
            disabled={fetchingEmails}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={fetchingEmails ? "animate-spin" : ""}
            />
            <span>{fetchingEmails ? "Fetching..." : "Fetch Emails"}</span>
          </button>
          <button
            onClick={handleCompare}
            disabled={analyzing || proposals.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
          >
            <Sparkles size={20} className={analyzing ? "animate-pulse" : ""} />
            <span>{analyzing ? "Analyzing..." : "AI Analysis"}</span>
          </button>
        </div>
      </div>

      {/* AI Comparison Results */}
      {comparison && (
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">
              AI-Powered Analysis
            </h2>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
            <p className="text-gray-300 bg-black/20 rounded-lg p-4">
              {comparison.summary}
            </p>
          </div>

          {/* Vendor Scores */}
          {comparison.vendorScores && comparison.vendorScores.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Vendor Scores
              </h3>
              <div className="grid gap-4">
                {comparison.vendorScores.map((score, idx) => {
                  const vendor = proposals.find(
                    (p) => p.vendorId._id === score.vendorId
                  )?.vendorId;
                  return (
                    <div key={idx} className="bg-black/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">
                          {vendor?.name || "Unknown Vendor"}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-2xl font-bold text-green-400">
                            {score.score}/100
                          </span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-2">
                            Strengths
                          </p>
                          <ul className="space-y-1">
                            {score.strengths?.map((strength, i) => (
                              <li
                                key={i}
                                className="flex items-start space-x-2 text-sm text-green-300"
                              >
                                <CheckCircle2
                                  size={16}
                                  className="mt-0.5 flex-shrink-0"
                                />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-2">
                            Weaknesses
                          </p>
                          <ul className="space-y-1">
                            {score.weaknesses?.map((weakness, i) => (
                              <li
                                key={i}
                                className="flex items-start space-x-2 text-sm text-orange-300"
                              >
                                <AlertCircle
                                  size={16}
                                  className="mt-0.5 flex-shrink-0"
                                />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {comparison.recommendation && (
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                <CheckCircle2 className="text-green-400" size={24} />
                <span>Recommendation</span>
              </h3>
              <div className="space-y-3">
                <p className="text-white font-semibold">
                  Recommended Vendor:{" "}
                  <span className="text-green-400">
                    {proposals.find(
                      (p) =>
                        p.vendorId._id ===
                        comparison.recommendation.recommendedVendorId
                    )?.vendorId?.name || "Unknown"}
                  </span>
                </p>
                <p className="text-gray-300">
                  {comparison.recommendation.reasoning}
                </p>
                {comparison.recommendation.considerations &&
                  comparison.recommendation.considerations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">
                        Considerations:
                      </p>
                      <ul className="space-y-1">
                        {comparison.recommendation.considerations.map(
                          (consideration, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-300 flex items-start space-x-2"
                            >
                              <span className="text-purple-400">•</span>
                              <span>{consideration}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proposals List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Received Proposals ({proposals.length})
        </h2>

        {proposals.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-purple-500/20">
            <Mail className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400 mb-4">No proposals yet</p>
            <p className="text-sm text-gray-500">
              Fetch vendor emails or manually add proposals
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <div
                key={proposal._id}
                className="bg-gradient-to-br from-slate-800/60 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {proposal.vendorId?.name || "Unknown Vendor"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {proposal.vendorId?.email}
                    </p>
                  </div>
                  {proposal.score && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="text-purple-400" size={18} />
                      <span className="text-xl font-bold text-purple-300">
                        {proposal.score}
                      </span>
                    </div>
                  )}
                </div>

                {proposal.parsedData && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {proposal.parsedData.totalPrice && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <DollarSign className="text-green-400" size={16} />
                          <span className="text-xs text-gray-400">
                            Total Price
                          </span>
                        </div>
                        <p className="text-white font-semibold">
                          {proposal.parsedData.currency || "USD"}{" "}
                          {proposal.parsedData.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {proposal.parsedData.deliveryTime && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="text-blue-400" size={16} />
                          <span className="text-xs text-gray-400">
                            Delivery
                          </span>
                        </div>
                        <p className="text-white font-semibold">
                          {proposal.parsedData.deliveryTime}
                        </p>
                      </div>
                    )}
                    {proposal.parsedData.paymentTerms && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="text-purple-400" size={16} />
                          <span className="text-xs text-gray-400">Payment</span>
                        </div>
                        <p className="text-white font-semibold">
                          {proposal.parsedData.paymentTerms}
                        </p>
                      </div>
                    )}
                    {proposal.parsedData.warranty && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle2 className="text-green-400" size={16} />
                          <span className="text-xs text-gray-400">
                            Warranty
                          </span>
                        </div>
                        <p className="text-white font-semibold">
                          {proposal.parsedData.warranty}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {proposal.parsedData?.items &&
                  proposal.parsedData.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        Items:
                      </p>
                      <div className="space-y-2">
                        {proposal.parsedData.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-black/20 rounded-lg p-3 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">
                                {item.name}
                              </span>
                              <span className="text-green-400 font-semibold">
                                $
                                {item.totalPrice?.toLocaleString() ||
                                  item.unitPrice?.toLocaleString()}
                              </span>
                            </div>
                            {item.quantity && (
                              <p className="text-gray-400 text-xs mt-1">
                                Qty: {item.quantity} × $
                                {item.unitPrice?.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {proposal.parsedData?.notes && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Notes:</p>
                    <p className="text-sm text-gray-300">
                      {proposal.parsedData.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalComparison;
