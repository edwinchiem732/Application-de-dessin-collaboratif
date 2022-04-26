package com.example.colorimage.avatar_dialog


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.R


class AvatarListAdapter(
    private val mDataset: Array<Int>,
    internal var recyclerViewItemClickListener: RecyclerViewItemClickListener
) : RecyclerView.Adapter<AvatarListAdapter.AvatarViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, i: Int): AvatarViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.avatar_item, parent, false)
        return AvatarViewHolder(v)
    }

    override fun onBindViewHolder(avatarViewHolder: AvatarViewHolder, i: Int) {
        avatarViewHolder.mImageView.setImageResource(mDataset[i])

        avatarViewHolder.mImageView.setOnClickListener {
            recyclerViewItemClickListener.clickOnItem(avatarViewHolder.adapterPosition)
        }

    }

    override fun getItemCount(): Int {
        return mDataset.size
    }

    inner class AvatarViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        var mImageView: ImageView

        init {
            mImageView = v.findViewById(R.id.avatar_image)
        }
    }

    interface RecyclerViewItemClickListener {
        fun clickOnItem(data: Int)
    }
}

