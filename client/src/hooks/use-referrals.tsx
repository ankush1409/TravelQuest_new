import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  referralXp: number;
  pendingReferrals: number;
  recentReferrals: Array<{
    id: string;
    referredUser: {
      displayName: string;
      profilePicture?: string;
    };
    xpAwarded: number;
    createdAt: string;
    status: string;
  }>;
}

interface ReferralLink {
  referralCode: string;
  referralLink: string;
  shareMessage: string;
}

export function useReferrals() {
  const { toast } = useToast();

  // Fetch referral stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    retry: 1,
  });

  // Generate referral link mutation
  const generateLinkMutation = useMutation({
    mutationFn: async (): Promise<ReferralLink> => {
      const res = await apiRequest("POST", "/api/referrals/generate-link");
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate stats to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
      
      toast({
        title: "Referral Link Generated!",
        description: "Share your link to start earning XP from referrals",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate referral link",
        variant: "destructive",
      });
    },
  });

  // Process referral mutation (for new user signups)
  const processReferralMutation = useMutation({
    mutationFn: async ({ referralCode, newUserId }: { referralCode: string; newUserId: string }) => {
      const res = await apiRequest("POST", "/api/referrals/process", {
        referralCode,
        newUserId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
    },
    onError: (error: Error) => {
      console.error("Failed to process referral:", error.message);
    },
  });

  // Complete referral mutation (when user finishes onboarding)
  const completeReferralMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/referrals/complete");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] }); // Refresh user data for XP update
      
      toast({
        title: "🎉 Referral Bonus Awarded!",
        description: "Someone joined TravelQuest with your link. +500 XP earned!",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      console.error("Failed to complete referral:", error.message);
    },
  });

  return {
    // Data
    stats,
    isLoading: statsLoading,
    error: statsError,
    
    // Mutations
    generateLink: generateLinkMutation.mutate,
    isGeneratingLink: generateLinkMutation.isPending,
    generatedLink: generateLinkMutation.data,
    
    processReferral: processReferralMutation.mutate,
    isProcessingReferral: processReferralMutation.isPending,
    
    completeReferral: completeReferralMutation.mutate,
    isCompletingReferral: completeReferralMutation.isPending,
  };
}

// Hook for handling referral code from URL (for new users)
export function useReferralFromUrl() {
  const processReferral = (newUserId: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && newUserId) {
      // Process the referral
      const processReferralMutation = useMutation({
        mutationFn: async () => {
          const res = await apiRequest("POST", "/api/referrals/process", {
            referralCode,
            newUserId
          });
          return await res.json();
        },
        onSuccess: () => {
          // Clean up URL
          const newUrl = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, newUrl);
        },
        onError: (error: Error) => {
          console.error("Failed to process referral from URL:", error.message);
        },
      });
      
      processReferralMutation.mutate();
    }
  };

  return { processReferral };
}