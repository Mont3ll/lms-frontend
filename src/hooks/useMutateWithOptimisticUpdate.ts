import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner"; // Replace useToast with Sonner
import { getApiErrorMessage } from "@/lib/api"; // Error handling helper

interface UseOptimisticMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "onMutate" | "onError" | "onSuccess" | "onSettled"
  > {
  queryKeyToInvalidate: unknown[]; // Query key to update optimistically and invalidate
  successMessage?: string;
  errorMessage?: string;
  // Function to determine how to update the cache optimistically
  optimisticUpdateFn: (
    variables: TVariables,
    context: TContext | undefined,
    oldData: TData[] | undefined,
  ) => TData[] | undefined;
}

export function useMutateWithOptimisticUpdate<
  TData = unknown, // Type of data returned by mutation fn
  TError = AxiosError, // Default error type
  TVariables = void, // Type of variables passed to mutation fn
  TContext = unknown, // Type of context returned by onMutate
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseOptimisticMutationOptions<TData, TError, TVariables, TContext>,
) {
  const queryClient = useQueryClient();
  const {
    queryKeyToInvalidate,
    successMessage,
    errorMessage = "An error occurred", // Default error message
    optimisticUpdateFn,
    ...mutationOptions // Rest of the standard useMutation options
  } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeyToInvalidate });

      // Snapshot the previous value
      const previousData =
        queryClient.getQueryData<TData[]>(queryKeyToInvalidate); // Assuming list data

      // Optimistically update to the new value using the provided function
      queryClient.setQueryData<TData[] | undefined>(
        queryKeyToInvalidate,
        (oldData) => {
          // Pass necessary context if needed, though onMutate context is defined below
          // For simple list updates, oldData and variables might be enough
          return optimisticUpdateFn(variables, undefined, oldData);
        },
      );

      // Return a context object with the snapshotted value
      return { previousData } as TContext; // Cast context type
    },
    onError: (_error, _variables, context) => {
      // Rollback on failure using the context returned from onMutate
      if (context && (context as { previousData?: TData[] }).previousData) {
        queryClient.setQueryData(
          queryKeyToInvalidate,
          (context as { previousData?: TData[] }).previousData,
        );
      }
      const errorMsg = getApiErrorMessage(_error);
      toast.error("Error", {
        description: `${errorMessage}: ${errorMsg}`,
      });
      console.error("Mutation error:", _error);
    },
    onSuccess: (data) => {
      if (successMessage) {
        toast.success("Success", {
          description: successMessage,
        });
      }
      console.log("Mutation success:", data);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    },
    ...mutationOptions, // Spread the rest of the options like retry, etc.
  });
}

/* Example Usage in a component:

const queryClient = useQueryClient();
const { mutate: addTodo } = useMutateWithOptimisticUpdate(
    (newTodo) => api.addTodo(newTodo), // Your API function
    {
        queryKeyToInvalidate: ['todos'],
        successMessage: "Todo added successfully!",
        optimisticUpdateFn: (newTodo, context, oldTodos) => {
            // Return the new list with the optimistic item added
            const optimisticTodo = { id: Math.random(), text: newTodo.text, ... }; // Create placeholder
            return oldTodos ? [...oldTodos, optimisticTodo] : [optimisticTodo];
        },
        // Optional onSuccess if you need data from the response
        onSuccess: (data, newTodo) => {
            // Can update cache more accurately with server response if needed,
            // but invalidateQueries often handles this.
            // queryClient.setQueryData(['todos'], (old: any) => ...)
        }
    }
);

// Call it:
addTodo({ text: "Buy milk" });

*/
