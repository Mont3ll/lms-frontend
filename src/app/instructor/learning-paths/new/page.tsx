import React from "react";

export default function NewLearningPathPage() {
  // TODO: Implement form submission and API integration
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Learning Path</h1>
      <form className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input type="text" name="title" className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" className="input input-bordered w-full min-h-[80px]" />
        </div>
        <button type="submit" className="btn btn-primary w-full mt-4">Create Learning Path</button>
      </form>
    </div>
  );
}
