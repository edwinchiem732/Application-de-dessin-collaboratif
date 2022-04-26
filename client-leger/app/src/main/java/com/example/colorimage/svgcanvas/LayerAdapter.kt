package com.example.colorimage.svgcanvas


import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.R
import com.mocircle.cidrawing.board.Layer


class LayerAdapter : RecyclerView.Adapter<LayerAdapter.ViewHolder>() {
    interface OnRecyclerViewItemClickListener {
        fun onItemClick(view: View?, layer: Layer?)
    }

    private var layerList: List<Layer> = ArrayList()
    private var listener: OnRecyclerViewItemClickListener? = null
    fun setLayers(layerList: List<Layer>) {
        this.layerList = layerList
    }

    fun setOnItemClick(listener: OnRecyclerViewItemClickListener?) {
        this.listener = listener
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v: View =
            LayoutInflater.from(parent.context)
                .inflate(R.layout.svgcanvas_layer_item_layout, parent, false)
        val vh = ViewHolder(v)
        vh.nameText = v.findViewById<View>(R.id.name_text) as TextView
        vh.visibleBox = v.findViewById<View>(R.id.visible_checkbox) as CheckBox
        v.setOnClickListener { v ->
            listener!!.onItemClick(
                v,
                v.tag as Layer
            )
        }
        return vh
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val layer = layerList[position]
        holder.itemView.tag = layer
        holder.nameText!!.text = layer.name
        holder.visibleBox!!.isChecked = layer.isVisible
        holder.visibleBox!!.setOnCheckedChangeListener { buttonView, isChecked ->
            layer.isVisible = isChecked
            notifyDataSetChanged()
        }
        if (layer.isSelected) {
            holder.itemView.setBackgroundColor(Color.parseColor("#eeeeee"))
        } else {
            holder.itemView.setBackgroundColor(0)
        }
    }

    override fun getItemCount(): Int {
        return layerList.size
    }

    class ViewHolder(itemView: View?) : RecyclerView.ViewHolder(itemView!!) {
        var nameText: TextView? = null
        var visibleBox: CheckBox? = null
    }
}